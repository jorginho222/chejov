import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LuggageRules } from '../valueObjects/luggageRules';
import { FlightClassPriceIncrements } from '../../flights/valueObjects/flight.class.price.increments';
import {
  flightClassPriceIncrementsTransformer,
  luggageRulesTransformer,
} from '../transformers/airlineTransformers';

@Entity()
export class Airline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({
    type: 'json',
    transformer: luggageRulesTransformer,
  })
  luggageRules: LuggageRules;

  @Column({
    type: 'json',
    transformer: flightClassPriceIncrementsTransformer,
  })
  flightClassPriceIncrements: FlightClassPriceIncrements[];

  @Column()
  redeemFee: number;
}
