import { ApiProperty } from '@nestjs/swagger';

export class ImportResultDto {
  @ApiProperty({
    example: 20,
    description: 'Cantidad de registros importados',
  })
  imported: number;
}
