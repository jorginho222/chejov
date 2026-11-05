import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDefined,
  IsNumber,
  IsString,
  IsUUID,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { LuggageRules } from '../valueObjects/luggageRules';
import { FlightClassPriceIncrements } from '../../flights/valueObjects/flight.class.price.increments';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// IATA airline designators, such as LA or U2
export const AIRLINE_CODE_PATTERN = /^[A-Z0-9]{2}$/;

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
    example: 'LG',
    description:
      'Código IATA de la aerolínea: 2 letras o dígitos, único. Se guarda en mayúsculas',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Matches(AIRLINE_CODE_PATTERN, {
    message: 'code must be 2 letters or digits, such as LA or U2',
  })
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
  @IsDefined()
  @ValidateNested()
  @Type(() => LuggageRules)
  luggageRules: LuggageRules;

  @ApiProperty({
    type: [FlightClassPriceIncrements],
    example: [
      {
        class: 'economy',
        increment: {
          value: 10,
        },
      },
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique((item?: FlightClassPriceIncrements) => item?.class)
  @ValidateNested({ each: true })
  @Type(() => FlightClassPriceIncrements)
  flightClassPriceIncrements: Array<FlightClassPriceIncrements>;

  @ApiProperty({
    example: 100,
    description: 'Tarifa de canje',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  redeemFee: number;
}
