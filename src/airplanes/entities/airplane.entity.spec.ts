import { Airplane } from './airplane.entity';
import { FlightClasses } from '../../flights/types/flight.classes';
import { AirplaneSeatConfig } from '../valueObjects/airplane.seat.config';

const seats = (
  flightClass: string,
  rowsQuantity: unknown,
  columnsQuantity: unknown,
): AirplaneSeatConfig =>
  ({ class: flightClass, rowsQuantity, columnsQuantity }) as AirplaneSeatConfig;

const buildAirplane = (
  seatsConfig: AirplaneSeatConfig[],
  passengersCapacity: number,
): Airplane =>
  Object.assign(new Airplane(), {
    id: 'plane-1',
    passengersCapacity,
    seatsConfig,
  });

describe('Airplane.validate', () => {
  it('accepts classes within range whose seats add up to the capacity', () => {
    const airplane = buildAirplane(
      [seats(FlightClasses.Economy, 100, 6), seats(FlightClasses.First, 1, 26)],
      626,
    );

    expect(() => airplane.validate()).not.toThrow();
  });

  it.each([
    ['no classes', [], 0, 'has no seat classes'],
    [
      'an unknown class',
      [seats('firstClass', 2, 4)],
      8,
      'unknown seat class firstClass',
    ],
    [
      'a repeated class',
      [seats('economy', 2, 4), seats('economy', 3, 4)],
      20,
      'repeats the seat class economy',
    ],
    ['zero rows', [seats('economy', 0, 4)], 0, '1 to 100 economy rows'],
    ['101 rows', [seats('economy', 101, 4)], 404, '1 to 100 economy rows'],
    [
      'fractional rows',
      [seats('economy', 2.5, 4)],
      10,
      '1 to 100 economy rows',
    ],
    ['27 columns', [seats('business', 2, 27)], 54, '1 to 26 business columns'],
    [
      'columns as text',
      [seats('business', 2, '4')],
      8,
      '1 to 26 business columns',
    ],
    [
      'a capacity that differs from the seats',
      [seats('economy', 25, 6)],
      160,
      'has a capacity of 160 but 150 seats',
    ],
  ])('rejects %s', (_, seatsConfig, capacity, message) => {
    const airplane = buildAirplane(seatsConfig, capacity);

    expect(() => airplane.validate()).toThrow(message);
  });
});
