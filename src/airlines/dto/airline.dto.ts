import {
  IsNumber,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { LuggageRules } from '../valueObjects/luggageRules';
import { FlightClassPriceIncrements } from '../../flights/valueObjects/flight.class.price.increments';
import { Type } from 'class-transformer';

export class AirlineDto {
  @IsUUID('4')
  id: string;

  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(2, 2)
  code: string;

  @ValidateNested()
  @Type(() => LuggageRules)
  luggageRules: LuggageRules;

  @ValidateNested()
  @Type(() => Array<FlightClassPriceIncrements>)
  flightClassPriceIncrements: Array<FlightClassPriceIncrements>;

  @IsNumber()
  redeemFee: number;
}
