import { ApiProperty } from '@nestjs/swagger';

export class FlightSelectionDto {
  @ApiProperty({
    example: '1edf4131-fe1a-4f97-8a45-aa78d1531669',
    description: 'ID del vuelo seleccionado. Formato UUID v4',
  })
  flightId: string;

  @ApiProperty({
    example: 1,
    description: 'Cantidad de boletos a comprar',
  })
  purchaseQuantity: number;

  @ApiProperty({
    example: 1,
    description: 'Cantidad de boletos a canjear',
  })
  redeemQuantity: number;
}
