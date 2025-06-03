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

export class CreateFlightDto {
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  airline: AirlineDto;

  @IsDate()
  @Type(() => Date)
  departure: Date;

  @IsDate()
  @Type(() => Date)
  arrival: Date;

  @IsNotEmpty()
  airplane: CreateAirplaneDto;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsNumber()
  basePrice: number;

  @IsNumber()
  distance: number;
}
