import { IsString, IsUUID, Length } from 'class-validator';

export class AirlineDto {
  @IsUUID('4')
  id: string;

  @IsString()
  name: string;

  @IsString()
  @Length(2, 2)
  code: string;
}
