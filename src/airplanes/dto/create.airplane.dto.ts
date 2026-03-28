import { AirplaneSeatConfig } from '../valueObjects/airplane.seat.config';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAirplaneDto {
  @ApiProperty({
    example: '1edf4131-fe1a-4f97-8a45-aa78d1531667',
    description: 'ID del avión. Formato UUID v4',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    example: 'Churqui 2',
    description: 'Marca del avión',
  })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({
    example: 'Patalenga',
    description: 'Modelo del avión',
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    example: 200,
    description: 'Capacidad de pasajeros del avión',
  })
  @IsNumber()
  passengersCapacity: number;

  @ApiProperty({
    type: [AirplaneSeatConfig],
    description: 'Configuración de asientos del avión',
  })
  @IsNotEmpty()
  seatsConfig: Array<AirplaneSeatConfig>;
}
