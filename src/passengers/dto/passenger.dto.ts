import { IsEmail, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class PassengerDto {
  @IsUUID('4', { message: 'id must be a valid uuid' })
  id: string;

  @IsString()
  @IsNotEmpty()
  @Length(7, 9, {
    message: 'Document number must be between 7 and 9 characters long',
  })
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
