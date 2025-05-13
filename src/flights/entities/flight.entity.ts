import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Airplane } from '../../airplanes/entities/airplane.entity';
import { Passenger } from '../../passengers/entities/passenger.entity';
import { FlightStatus } from '../types/flight.status';
import { FlightCode } from '../valueObjects/flight.code';
import { AirplaneSeat } from '../valueObjects/airplane.seat';
import { BadRequestException } from '@nestjs/common';
import { Airline } from '../../airlines/entities/airline.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity()
export class Flight {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column('json')
  readonly code: FlightCode;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @ManyToOne(() => Airplane)
  airplane: Airplane;

  @ManyToOne(() => Airline)
  airline: Airline;

  @Column()
  departure: Date;

  @Column()
  arrival: Date;

  @ManyToMany(() => Passenger, (passenger) => passenger.flights)
  @JoinTable({
    name: 'flight_passengers',
    joinColumns: [{ name: 'flight_id' }],
    inverseJoinColumns: [{ name: 'passenger_id' }],
  })
  passengers: Array<Passenger>;

  @OneToMany(() => Order, (order) => order.flight)
  orders: Array<Order>;

  @Column()
  status: FlightStatus;

  @Column('json')
  seats: Array<AirplaneSeat>;

  @Column()
  basePrice: number;

  @Column({ default: false })
  isFullyReserved: boolean;

  setStatus(status: FlightStatus) {
    this.status = status;
  }

  setSchedule(departure: Date, arrival: Date) {
    const status =
      departure < this.departure ? FlightStatus.Advanced : FlightStatus.Delayed;

    this.setDeparture(departure);
    this.setArrival(arrival);
    this.validateSchedule();

    this.setStatus(status);
  }

  setDeparture(departure: Date) {
    this.departure = departure;
  }

  setArrival(arrival: Date) {
    this.arrival = arrival;
  }

  validate() {
    this.validateRoute();
    this.validateSchedule();
  }

  validateRoute() {
    if (this.origin === this.destination) {
      throw new Error('Origin and destination must be different');
    }
  }

  validateSchedule() {
    if (this.departure > this.arrival) {
      throw new Error('Departure must be before arrival');
    }
  }

  setSeats() {
    const seatsConfig = this.airplane.seatsConfig;
    const seats: Array<AirplaneSeat> = [];
    let globalRow = 0;

    seatsConfig.forEach((seatConfig) => {
      for (let row = 1; row <= seatConfig.rowsQuantity; row++) {
        for (let column = 0; column < seatConfig.columnsQuantity; column++) {
          const seat: AirplaneSeat = {
            class: seatConfig.class,
            column: String.fromCharCode(97 + column), // generates letters from 'a' to 'z'
            row: globalRow,
            passengerId: null,
          };
          seats.push(seat);
        }

        globalRow++;
      }
    });

    this.seats = seats;
  }

  reserveSeat(seat: AirplaneSeat, passenger: Passenger) {
    const seatSearchResult = this.seats.findIndex(
      (s) => s.column === seat.column && s.row === seat.row,
    );

    if (seatSearchResult === -1) {
      throw new BadRequestException('Seat not found');
    }
    if (null !== this.seats[seatSearchResult].passengerId) {
      throw new BadRequestException('Seat already reserved');
    }

    this.seats[seatSearchResult].passengerId = seat.passengerId;

    this.checkFlightAvailability();

    this.passengers.push(passenger);
  }

  cancelSeatReservation(seat: AirplaneSeat) {
    const seatSearch = this.seats.find(
      (flightSeat) =>
        flightSeat.row === seat.row && flightSeat.column === seat.column,
    );
    if (!seatSearch) {
      throw new BadRequestException('Seat not found');
    }
    if (seatSearch.passengerId !== seat.passengerId) {
      throw new BadRequestException('Seat not reserved by passenger');
    }

    seatSearch.passengerId = null;
    this.isFullyReserved = false;
  }

  private checkFlightAvailability() {
    this.isFullyReserved = !this.seats.some((seat) => !seat.passengerId);
  }
}
