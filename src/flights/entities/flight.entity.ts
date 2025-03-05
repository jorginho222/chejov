import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Airplane } from '../../airplanes/entities/airplane.entity';
import { Passenger } from '../../passengers/entities/passenger.entity';
import { FlightStatus } from '../types/flight.status';
import { FlightCode } from '../valueObjects/flight.code';
import { AirplaneSeat } from '../valueObjects/airplane.seat';
import { FlightPrices } from '../valueObjects/flight.prices';

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

  @Column()
  departure: Date;

  @Column()
  arrival: Date;

  @ManyToMany(() => Passenger, (passenger) => passenger.flights)
  passengers: Array<Passenger>;

  @Column()
  status: FlightStatus;

  @Column('json')
  seats: Array<AirplaneSeat>;

  @Column('json')
  flightPrices: Array<FlightPrices>;

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
      throw new Error('Seat not found');
    }
    if (null !== this.seats[seatSearchResult].passengerId) {
      throw new Error('Seat already reserved');
    }

    this.seats[seatSearchResult].passengerId = seat.passengerId;

    this.checkFlightAvailability();

    this.passengers.push(passenger);
  }

  private checkFlightAvailability() {
    this.isFullyReserved = !this.seats.some((seat) => !seat.passengerId);
  }
}
