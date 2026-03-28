import { FlightClasses } from '../../flights/types/flight.classes';
import { ApiProperty } from '@nestjs/swagger';

export class AirplaneSeatConfig {
  @ApiProperty({
    example: 'economy',
    description: 'Clase de los asientos',
  })
  class: FlightClasses;

  @ApiProperty({
    example: 6,
    description: 'Cantidad de filas para esta clase',
  })
  rowsQuantity: number;

  @ApiProperty({
    example: 6,
    description: 'Cantidad de columnas para esta clase',
  })
  columnsQuantity: number;
}
