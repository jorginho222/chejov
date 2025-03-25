import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AirplaneSeatConfig } from '../valueObjects/airplane.seat.config';

@Entity()
export class Airplane {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  passengersCapacity: number;

  @Column('json')
  seatsConfig: Array<AirplaneSeatConfig>;

  @Column({ default: '' })
  imageUrl: string;
}
