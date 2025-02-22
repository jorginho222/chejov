import { AirplaneDto } from '../../airplanes/dto/airplane.dto';
import { AirlineDto } from './airline.dto';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlightDto {
  @IsUUID('4')
  id: string;

  airline: AirlineDto;

  @IsDate()
  @Type(() => Date)
  departure: string;

  @IsDate()
  @Type(() => Date)
  arrival: string;

  airplane: AirplaneDto;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;
}
