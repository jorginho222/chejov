import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFlightStatusDto {
  @ApiProperty({
    example: '1edf4131-fe1a-4f97-8a45-aa78d1531669',
    description: 'ID del vuelo. Formato UUID v4',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    example: 'scheduled',
    description: 'Nuevo estado del vuelo',
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}
