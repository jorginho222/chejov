export class FlightCode {
  private readonly prefix: string;

  constructor(
    prefix: string,
    private readonly correlative: number,
  ) {
    this.validatePrefix(prefix);
    this.prefix = prefix;
  }

  toString(): string {
    return `${this.prefix}${this.correlative}`;
  }

  getPrefix(): string {
    return this.prefix;
  }

  getCorrelative(): number {
    return this.correlative;
  }

  validatePrefix(prefix: string): void {
    if (prefix.length !== 2) {
      throw new Error('Prefix must be 2 characters long');
    }
  }
}
