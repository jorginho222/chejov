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
import { FlightCode } from '../valueObjects/FlightCode';

@Entity()
export class Flight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('json')
  code: FlightCode;

  @Column()
  from: string;

  @Column()
  to: string;

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

  validateRoute() {
    if (this.from === this.to) {
      throw new Error('Origin and destination must be different');
    }
  }

  validateSchedule() {
    if (this.departure > this.arrival) {
      throw new Error('Departure must be before arrival');
    }
  }
}
