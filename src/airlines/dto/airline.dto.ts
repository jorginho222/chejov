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
import { ApiProperty } from '@nestjs/swagger';

export class AirlineDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la aerolínea. Formato UUID v4',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    example: 'Aerolíneas Lagarza',
    description: 'Nombre de la aerolínea',
  })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({
    example: 'LAG',
    description: 'Código de la aerolínea',
  })
  @IsString()
  @Length(2, 2)
  code: string;

  @ApiProperty({
    type: LuggageRules,
    example: {
      _priceHandBaggage: 100,
      _maxHandBaggage: 2,
      _priceCheckedLuggage: 100,
      _priceExceededWeight: 50,
    },
    description: 'Reglas de equipaje',
  })
  @ValidateNested()
  @Type(() => LuggageRules)
  luggageRules: LuggageRules;

  @ApiProperty({
    type: [FlightClassPriceIncrements],
    example: {
      class: 'economy',
      increment: {
        value: 10,
      },
    },
  })
  @ValidateNested()
  flightClassPriceIncrements: Array<FlightClassPriceIncrements>;

  @ApiProperty({
    example: 100,
    description: 'Tarifa de canje',
  })
  @IsNumber()
  redeemFee: number;
}
