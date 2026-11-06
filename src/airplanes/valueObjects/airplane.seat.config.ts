import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { FlightClasses } from '../../flights/types/flight.classes';
import { ApiProperty } from '@nestjs/swagger';

// Flight.setSeats names seat columns with the letters a to z
export const MAX_SEAT_COLUMNS = 26;
// Keeps the seats array every flight copies to a sensible size
export const MAX_SEAT_ROWS = 100;

export class AirplaneSeatConfig {
  @ApiProperty({
    example: 'economy',
    enum: FlightClasses,
    description: 'Clase de los asientos',
  })
  @IsEnum(FlightClasses)
  class: FlightClasses;

  @ApiProperty({
    example: 6,
    description: `Cantidad de filas para esta clase, entre 1 y ${MAX_SEAT_ROWS}`,
  })
  @IsInt()
  @Min(1)
  @Max(MAX_SEAT_ROWS)
  rowsQuantity: number;

  @ApiProperty({
    example: 6,
    description: `Cantidad de columnas para esta clase, entre 1 y ${MAX_SEAT_COLUMNS}`,
  })
  @IsInt()
  @Min(1)
  @Max(MAX_SEAT_COLUMNS)
  columnsQuantity: number;
}

export function isQuantityInRange(value: unknown, max: number): boolean {
  return (
    Number.isInteger(value) &&
    (value as number) >= 1 &&
    (value as number) <= max
  );
}

// Total seats, or undefined while any quantity breaks its own rule
export function countSeats(seatsConfig: unknown): number | undefined {
  if (!Array.isArray(seatsConfig) || seatsConfig.length === 0) {
    return undefined;
  }

  let total = 0;
  for (const config of seatsConfig as Partial<AirplaneSeatConfig>[]) {
    const { rowsQuantity, columnsQuantity } = config ?? {};
    if (
      !isQuantityInRange(rowsQuantity, MAX_SEAT_ROWS) ||
      !isQuantityInRange(columnsQuantity, MAX_SEAT_COLUMNS)
    ) {
      return undefined;
    }
    total += (rowsQuantity as number) * (columnsQuantity as number);
  }

  return total;
}
