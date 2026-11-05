import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FlightStatus } from '../types/flight.status';

export class SearchFlightsDto {
  @ApiPropertyOptional({ example: 'New York', description: 'Ciudad de origen' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  origin?: string;

  @ApiPropertyOptional({ example: 'London', description: 'Ciudad de destino' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  destination?: string;

  @ApiPropertyOptional({
    example: '2026-12-01T00:00:00Z',
    description: 'Salida igual o posterior a esta fecha',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  departureFrom?: Date;

  @ApiPropertyOptional({
    example: '2026-12-08T00:00:00Z',
    description: 'Salida igual o anterior a esta fecha',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  departureTo?: Date;

  @ApiPropertyOptional({
    enum: FlightStatus,
    example: FlightStatus.Scheduled,
    description: 'Estado del vuelo',
  })
  @IsOptional()
  @IsEnum(FlightStatus)
  status?: FlightStatus;

  @ApiPropertyOptional({ example: 'AC', description: 'Código de la aerolínea' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  airlineCode?: string;

  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
