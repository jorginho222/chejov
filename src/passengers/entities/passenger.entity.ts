import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Flight } from '../../flights/entities/flight.entity';

@Entity()
export class Passenger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentNumber: string;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @ManyToMany(() => Flight, (flight) => flight.passengers, { nullable: true })
  @JoinTable({
    name: 'flight_passengers',
    joinColumns: [{ name: 'passenger_id' }],
    inverseJoinColumns: [{ name: 'flight_id' }],
  })
  flights: Array<Flight>;
}
