import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateFlightStatusDto {
  @IsUUID('4')
  id: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
