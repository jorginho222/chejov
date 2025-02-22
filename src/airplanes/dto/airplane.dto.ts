import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class AirplaneDto {
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
}
