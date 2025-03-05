import { IsDate, IsUUID } from 'class-validator';

export class UpdateFlightScheduleDto {
  @IsUUID('4')
  id: string;

  @IsDate()
  departure: Date;

  @IsDate()
  arrival: Date;
}
