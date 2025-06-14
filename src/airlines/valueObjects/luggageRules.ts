export class LuggageRules {
  constructor(
    public _priceHandBaggage: number,
    public _maxHandBaggage: number,
    public _priceCheckedLuggage: number,
    public _priceExceededWeight: number,
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
