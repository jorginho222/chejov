export class AirplaneSeat {
  class: string;
  column: string;
  row: number;
  passengerId: null | string;

  toString(): string {
    return `${this.column} ${this.row}`;
  }
}
