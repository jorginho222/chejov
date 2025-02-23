import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateFlightDto {
  @IsUUID('4')
  id: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDate()
  departure: Date;

  @IsDate()
  arrival: Date;
}
