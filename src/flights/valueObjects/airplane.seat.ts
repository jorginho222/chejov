import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AirplaneSeat {
  @IsString()
  @IsNotEmpty()
  class: string;

  @IsString()
  @IsNotEmpty()
  column: string;

  @IsNumber()
  @IsNotEmpty()
  row: number;

  @IsString()
  @IsNotEmpty()
  passengerId: null | string;

  toString(): string {
    return `${this.column} ${this.row}`;
  }
}
