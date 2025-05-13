import { CreateAirplaneDto } from '../../airplanes/dto/create.airplane.dto';
import { AirlineDto } from '../../airlines/dto/airline.dto';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlightDto {
  @IsUUID('4')
  id: string;

  airline: AirlineDto;

  @IsDate()
  @Type(() => Date)
  departure: Date;

  @IsDate()
  @Type(() => Date)
  arrival: Date;

  airplane: CreateAirplaneDto;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;
}
