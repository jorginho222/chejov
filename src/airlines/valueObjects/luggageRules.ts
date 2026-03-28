import { ApiProperty } from '@nestjs/swagger';

export class LuggageRules {
  @ApiProperty({
    example: 100,
    description: 'Precio del equipaje de mano',
  })
  public _priceHandBaggage: number;

  @ApiProperty({
    example: 1,
    description: 'Cantidad máxima de equipaje de mano',
  })
  public _maxHandBaggage: number;

  @ApiProperty({
    example: 200,
    description: 'Precio del equipaje facturado',
  })
  public _priceCheckedLuggage: number;

  @ApiProperty({
    example: 300,
    description: 'Precio por exceso de peso',
  })
  public _priceExceededWeight: number;

  constructor(
    priceHandBaggage: number,
    maxHandBaggage: number,
    priceCheckedLuggage: number,
    priceExceededWeight: number,
  ) {
    this._priceHandBaggage = priceHandBaggage;
    this._maxHandBaggage = maxHandBaggage;
    this._priceCheckedLuggage = priceCheckedLuggage;
    this._priceExceededWeight = priceExceededWeight;
  }

  get priceHandBaggage(): number {
    return this._priceHandBaggage;
  }

  get maxHandBaggage(): number {
    return this._maxHandBaggage;
  }

  get priceCheckedLuggage(): number {
    return this._priceCheckedLuggage;
  }

  get priceExceededWeight(): number {
    return this._priceExceededWeight;
  }
}
