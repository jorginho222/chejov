import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class Percentage {
  @ApiProperty({
    example: 10,
    description: 'Valor del porcentaje',
  })
  @IsNumber()
  @Min(0)
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
