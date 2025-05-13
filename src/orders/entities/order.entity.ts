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
import { Passenger } from '../../passengers/entities/passenger.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Flight, (flight) => flight.orders)
  flight: Flight;

  @Column('json')
  luggage: Array<OrderLuggage>;

  @Column()
  class: FlightClasses;

  @ManyToMany(() => Passenger)
  passengers: Array<Passenger>;
}
