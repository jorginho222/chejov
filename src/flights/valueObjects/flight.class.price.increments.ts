import { Percentage } from '../../shared/common/percentage';
import { FlightClasses } from '../types/flight.classes';
import { ApiProperty } from '@nestjs/swagger';

export class FlightClassPriceIncrements {
  @ApiProperty({
    example: 'premiumEconomy',
    description: 'Clase del vuelo',
  })
  class: FlightClasses;

  @ApiProperty({
    type: Percentage,
    description: 'Incremento de precio para esta clase',
  })
  increment: Percentage;
}
