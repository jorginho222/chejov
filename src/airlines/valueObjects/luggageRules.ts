export class LuggageRules {
  constructor(
    private _maxHandBaggage: number,
    private _priceExceededBaggage: number,
    private _maxCheckedLuggage: number,
    private _priceCheckedLuggage: number,
  ) {}

  get maxHandBaggage(): number {
    return this._maxHandBaggage;
  }

  get priceExceededBaggage(): number {
    return this._priceExceededBaggage;
  }

  get maxCheckedLuggage(): number {
    return this._maxCheckedLuggage;
  }

  get priceCheckedLuggage(): number {
    return this._priceCheckedLuggage;
  }
}
