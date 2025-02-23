import { AirplaneDto } from '../../airplanes/dto/airplane.dto';
import { AirlineDto } from './airline.dto';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFlightDto {
  @IsUUID('4')
  id: string;

  airline: AirlineDto;

  @IsDate()
  departure: Date;

  @IsDate()
  arrival: Date;

  airplane: AirplaneDto;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;
}
