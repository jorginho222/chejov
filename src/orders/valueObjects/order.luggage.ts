export class OrderLuggage {
  constructor(
    private _handBaggageQuantity: number,
    private _checkedLuggageQuantity: number,
  ) {}

  get handBaggageQuantity(): number {
    return this._handBaggageQuantity;
  }

  get checkedLuggageQuantity(): number {
    return this._checkedLuggageQuantity;
  }
}
