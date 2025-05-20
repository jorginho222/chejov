export class OrderLuggage {
  constructor(
    private _handBaggageQuantity: number,
    private _checkedLuggageQuantity: number,
    private _isWeightExceeded: boolean,
  ) {}

  get handBaggageQuantity(): number {
    return this._handBaggageQuantity;
  }

  get checkedLuggageQuantity(): number {
    return this._checkedLuggageQuantity;
  }

  get isWeightExceeded(): boolean {
    return this._isWeightExceeded;
  }
}
