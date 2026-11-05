import { Percentage } from '../../shared/common/percentage';
import { FlightClasses } from '../types/flight.classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsEnum, ValidateNested } from 'class-validator';

export class FlightClassPriceIncrements {
  @ApiProperty({
    example: 'premiumEconomy',
    description: 'Clase del vuelo',
  })
  @IsEnum(FlightClasses)
  class: FlightClasses;

  @ApiProperty({
    type: Percentage,
    description: 'Incremento de precio para esta clase',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => Percentage)
  increment: Percentage;
}
