import { ApiProperty } from '@nestjs/swagger';

export class ImportAirlinesResultDto {
  @ApiProperty({
    example: 20,
    description: 'Cantidad de aerolíneas importadas',
  })
  imported: number;
}
