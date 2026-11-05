import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LuggageRules } from '../valueObjects/luggageRules';
import { FlightClassPriceIncrements } from '../../flights/valueObjects/flight.class.price.increments';
import {
  flightClassPriceIncrementsTransformer,
  luggageRulesTransformer,
} from '../transformers/airlineTransformers';
import { moneyColumn } from '../../shared/common/money';

@Entity()
export class Airline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // TypeORM names the constraint UQ_c7d301a4fa39c05abc095447310, and
  // ignores a custom name for a single-column unique, so keep it as is
  @Column({ unique: true })
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

  @Column(moneyColumn)
  redeemFee: number;
}
