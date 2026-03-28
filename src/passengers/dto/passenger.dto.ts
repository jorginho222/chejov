import { IsEmail, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PassengerDto {
  @ApiProperty({
    example: '1edf4131-fe1a-4f97-8a45-aa78d1531668',
    description: 'ID del pasajero. Formato UUID v4',
  })
  @IsUUID('4', { message: 'id must be a valid uuid' })
  id: string;

  @ApiProperty({
    example: '12345678',
    description: 'Número de documento del pasajero (entre 7 y 9 caracteres)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(7, 9, {
    message: 'Document number must be between 7 and 9 characters long',
  })
  documentNumber: string;

  @ApiProperty({
    example: 'Ivan',
    description: 'Nombre del pasajero',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Chejov',
    description: 'Apellido del pasajero',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'xGh3g@example.com',
    description: 'Correo electrónico del pasajero',
  })
  @IsEmail()
  email: string;
}
