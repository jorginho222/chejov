import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToMany(() => Flight, (flight) => flight.passengers, { nullable: true })
  flights: Array<Flight>;
}
