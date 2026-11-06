import { ValueTransformer } from 'typeorm';
import { FlightCode } from '../valueObjects/flight.code';

interface StoredFlightCode {
  prefix: string;
  correlative: number;
}

// Rebuilds the FlightCode instance on load, so its methods such as
// toString() work. Stores a plain object rather than a JSON string, so the
// column stays queryable with Postgres JSON operators (UQ_flight_code needs
// that).
export const flightCodeTransformer: ValueTransformer = {
  to: (value: FlightCode | null | undefined): StoredFlightCode | null => {
    if (!value) return null;

    return {
      prefix: value.getPrefix(),
      correlative: value.getCorrelative(),
    };
  },
  from: (value: string | StoredFlightCode | null): FlightCode | null => {
    if (value === null || value === undefined) return null;

    // Postgres returns json already parsed, while SQLite returns the text
    const stored =
      typeof value === 'string'
        ? (JSON.parse(value) as StoredFlightCode)
        : value;

    return new FlightCode(stored.prefix, stored.correlative);
  },
};
