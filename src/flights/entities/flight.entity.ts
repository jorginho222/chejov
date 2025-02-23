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

@Entity()
export class Flight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('json')
  code: FlightCode;

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

  setStatus(status: FlightStatus) {
    this.status = status;
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
}
