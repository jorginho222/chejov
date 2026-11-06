import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FlightClasses } from '../../flights/types/flight.classes';
import {
  AirplaneSeatConfig,
  countSeats,
  isQuantityInRange,
  MAX_SEAT_COLUMNS,
  MAX_SEAT_ROWS,
} from '../valueObjects/airplane.seat.config';

const FLIGHT_CLASSES: string[] = Object.values(FlightClasses);

@Entity()
export class Airplane {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand: string;

  // TypeORM names the constraint UQ_ba88131180005a1b73cb730a84e, and
  // ignores a custom name for a single-column unique, so keep it as is
  @Column({ unique: true })
  model: string;

  @Column()
  passengersCapacity: number;

  @Column('json')
  seatsConfig: Array<AirplaneSeatConfig>;

  @Column({ default: '' })
  imageUrl: string;

  // Same rules as CreateAirplaneDto, for airplanes that did not come
  // through it, such as ones stored before those rules existed
  validate(): void {
    this.validateSeatsConfig();
    this.validateCapacity();
  }

  private validateSeatsConfig(): void {
    if (!Array.isArray(this.seatsConfig) || this.seatsConfig.length === 0) {
      throw new Error(`Airplane ${this.id} has no seat classes`);
    }

    const seen = new Set<string>();
    for (const { class: flightClass, rowsQuantity, columnsQuantity } of this
      .seatsConfig) {
      if (!FLIGHT_CLASSES.includes(flightClass)) {
        throw new Error(
          `Airplane ${this.id} has an unknown seat class ${flightClass}`,
        );
      }
      if (seen.has(flightClass)) {
        throw new Error(
          `Airplane ${this.id} repeats the seat class ${flightClass}`,
        );
      }
      seen.add(flightClass);

      if (!isQuantityInRange(rowsQuantity, MAX_SEAT_ROWS)) {
        throw new Error(
          `Airplane ${this.id} must have 1 to ${MAX_SEAT_ROWS} ${flightClass} rows`,
        );
      }
      if (!isQuantityInRange(columnsQuantity, MAX_SEAT_COLUMNS)) {
        throw new Error(
          `Airplane ${this.id} must have 1 to ${MAX_SEAT_COLUMNS} ${flightClass} columns`,
        );
      }
    }
  }

  private validateCapacity(): void {
    const seats = countSeats(this.seatsConfig);
    if (this.passengersCapacity !== seats) {
      throw new Error(
        `Airplane ${this.id} has a capacity of ${this.passengersCapacity} but ${seats} seats`,
      );
    }
  }
}
