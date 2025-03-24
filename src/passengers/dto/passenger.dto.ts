import { IsEmail, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class PassengerDto {
  @IsUUID('4')
  id: string;

  @IsString()
  @IsNotEmpty()
  @Length(7, 9)
  documentNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;
}
