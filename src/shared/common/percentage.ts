import { ApiProperty } from '@nestjs/swagger';

export class Percentage {
  @ApiProperty({
    example: 10,
    description: 'Valor del porcentaje',
  })
  public value: number;

  constructor(value: number) {
    this.value = value;
  }

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
