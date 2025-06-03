import { AirplaneSeatConfig } from '../valueObjects/airplane.seat.config';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateAirplaneDto {
  @IsUUID('4')
  id: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  passengersCapacity: number;

  @IsNotEmpty()
  seatsConfig: Array<AirplaneSeatConfig>;
}
