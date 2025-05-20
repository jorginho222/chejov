export class LuggageRules {
  constructor(
    private _priceHandBaggage: number,
    private _maxHandBaggage: number,
    private _priceCheckedLuggage: number,
    private _priceExceededWeight: number,
  ) {}

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
