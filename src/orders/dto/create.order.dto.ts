import { FlightSelectionDto } from './flightSelectionDto';
import { FlightClasses } from '../../flights/types/flight.classes';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    example: '1edf4131-fe1a-4f97-8a45-aa78d1531670',
    description: 'ID de la orden. Formato UUID v4',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    type: [FlightSelectionDto],
    description: 'Selección de vuelos para la orden',
  })
  @IsNotEmpty()
  flightSelection: FlightSelectionDto[];

  @ApiProperty({
    example: 2,
    description: 'Cantidad de equipaje de mano',
  })
  @IsNumber()
  handBaggageQuantity: number;

  @ApiProperty({
    example: 1,
    description: 'Cantidad de equipaje facturado',
  })
  @IsNumber()
  checkedLuggageQuantity: number;

  @ApiProperty({
    example: 'premiumEconomy',
    description: 'Clase del vuelo',
  })
  @IsString()
  @IsNotEmpty()
  class: FlightClasses;

  @ApiProperty({
    example: '1edf4131-fe1a-4f97-8a45-aa78d1531668',
    description: 'ID del usuario. Formato UUID v4',
  })
  @IsUUID('4')
  userId: string;
}
