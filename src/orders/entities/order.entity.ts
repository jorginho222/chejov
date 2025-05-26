import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Flight } from '../../flights/entities/flight.entity';
import { OrderLuggage } from '../valueObjects/order.luggage';
import { FlightClasses } from '../../flights/types/flight.classes';
import { User } from '../../users/entities/user.entity';
import { FlightSelectionDto } from '../dto/flightSelectionDto';
import { CreateOrderDto } from '../dto/create.order.dto';
import { OrderStatus } from '../types/order.status';

@Entity()
export class Order {
  redeemedQuantity: number;

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  number: string;

  @Column()
  status: OrderStatus;

  @ManyToMany(() => Flight, (flight) => flight.orders)
  flights: Array<Flight>;

  @Column('json')
  luggage: OrderLuggage;

  @Column()
  class: FlightClasses;

  @ManyToOne(() => User)
  user: User;

  @Column()
  passengersQuantity: number;

  @Column()
  exchangedMiles: number = 0;

  @Column()
  flightsTotal: number = 0;

  @Column()
  luggageTotal: number = 0;

  @Column()
  redeemFee: number = 0;

  // TODO: store value in cents? round in before save event
  @Column()
  grandTotal: number = 0;

  public calculateTotal(orderDto: CreateOrderDto): void {
    const flightSelectionDtoArray = orderDto.flightSelection;
    this.redeemFlightsWithMiles(flightSelectionDtoArray);
    this.calculateFlightTotal(flightSelectionDtoArray);
    this.calculateLuggageTotal();

    this.grandTotal = this.flightsTotal + this.luggageTotal + this.redeemFee;
  }

  private calculateFlightTotal(
    flightSelectionArray: FlightSelectionDto[],
  ): void {
    flightSelectionArray.forEach((flightSelection) => {
      if (flightSelection.purchaseQuantity === 0) {
        return;
      }

      const flight = this.flights.find(
        (flight) => flight.id === flightSelection.flightId,
      );
      if (!flight) {
        throw new Error('Flight not found');
      }
      const airline = flight.airline;
      const incrementPercentage = airline.flightClassPriceIncrements.find(
        (increment) => increment.class === this.class,
      );
      if (!incrementPercentage) {
        throw new Error('Increment not found');
      }
      const incrementAmount =
        (flight.basePrice * incrementPercentage.increment.getValue()) / 100;
      this.flightsTotal +=
        (flight.basePrice + incrementAmount) * flightSelection.purchaseQuantity;
    });
  }

  private calculateLuggageTotal(): void {
    this.flights.forEach((flight) => {
      let partialTotal = 0;

      const airlineLuggageRules = flight.airline.luggageRules;
      if (
        this.luggage.handBaggageQuantity > airlineLuggageRules.maxHandBaggage
      ) {
        partialTotal +=
          airlineLuggageRules.priceHandBaggage *
          (this.luggage.handBaggageQuantity -
            airlineLuggageRules.maxHandBaggage);
      }

      partialTotal +=
        this.luggage.checkedLuggageQuantity *
        airlineLuggageRules.priceCheckedLuggage;

      if (this.luggage.isWeightExceeded) {
        partialTotal += airlineLuggageRules.priceExceededWeight;
      }

      this.luggageTotal = partialTotal;
    });
  }

  private redeemFlightsWithMiles(
    flightSelectionDtoArray: FlightSelectionDto[],
  ): void {
    let availableMiles = this.user.accumulatedMiles;

    flightSelectionDtoArray.forEach((flightSelection) => {
      if (flightSelection.redeemQuantity === 0) {
        return;
      }
      const flight = this.flights.find(
        (flight) => flight.id === flightSelection.flightId,
      );
      if (!flight) {
        throw new Error('Flight not found');
      }

      const necessaryMiles = flight.distance * flightSelection.redeemQuantity;
      if (availableMiles < necessaryMiles) {
        throw new Error('Not enough miles to redeem selected flights');
      }

      availableMiles -= necessaryMiles;
      this.exchangedMiles += necessaryMiles;
      this.redeemedQuantity += flightSelection.redeemQuantity;
      this.redeemFee =
        flightSelection.redeemQuantity * flight.airline.redeemFee;
    });
  }
}
