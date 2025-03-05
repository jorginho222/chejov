import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { AirplaneSeatConfig } from '../valueObjects/airplane.seat.config';

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
