import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LuggageRules } from '../valueObjects/luggageRules';
import { FlightClassPriceIncrements } from '../../flights/valueObjects/flight.class.price.increments';

@Entity()
export class Airline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column('json')
  luggageRules: Array<LuggageRules>;

  @Column('json')
  flightClassPriceIncrements: FlightClassPriceIncrements;
}
