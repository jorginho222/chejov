import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFlightStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}
