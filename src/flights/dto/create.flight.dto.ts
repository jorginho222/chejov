import { CreateAirplaneDto } from '../../airplanes/dto/create.airplane.dto';
import { AirlineDto } from '../../airlines/dto/airline.dto';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFlightDto {
  @ApiProperty({
    example: '1edf4131-fe1a-4f97-8a45-aa78d1531669',
    description: 'ID del vuelo. Formato UUID v4',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    type: AirlineDto,
    description: 'Aerolínea del vuelo',
  })
  @IsNotEmpty()
  airline: AirlineDto;

  @ApiProperty({
    example: '2025-06-04T21:07:31-03:00',
    description: 'Fecha y hora de salida',
  })
  @IsDate()
  @Type(() => Date)
  departure: Date;

  @ApiProperty({
    example: '2025-06-04T23:07:31-03:00',
    description: 'Fecha y hora de llegada',
  })
  @IsDate()
  @Type(() => Date)
  arrival: Date;

  @ApiProperty({
    type: CreateAirplaneDto,
    description: 'Avión del vuelo',
  })
  @IsNotEmpty()
  airplane: CreateAirplaneDto;

  @ApiProperty({
    example: 'New York',
    description: 'Ciudad de origen',
  })
  @IsString()
  @IsNotEmpty()
  origin: string;

  @ApiProperty({
    example: 'Los Angeles',
    description: 'Ciudad de destino',
  })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({
    example: 1000,
    description: 'Precio base del vuelo',
  })
  @IsNumber()
  basePrice: number;

  @ApiProperty({
    example: 1000,
    description: 'Distancia del vuelo en kilómetros',
  })
  @IsNumber()
  distance: number;
}
