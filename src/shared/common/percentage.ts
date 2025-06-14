export class Percentage {
  constructor(public value: number) {}

  getValue(): number {
    return this.value;
  }

  setValue(value: number): void {
    this.value = value;
  }

  toString(): string {
    return `${this.value}%`;
  }
}
