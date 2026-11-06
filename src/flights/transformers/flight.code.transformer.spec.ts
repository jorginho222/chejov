import { FlightCode } from '../valueObjects/flight.code';
import { flightCodeTransformer } from './flight.code.transformer';

describe('flightCodeTransformer', () => {
  it('stores the code as a plain object', () => {
    const stored: unknown = flightCodeTransformer.to(new FlightCode('AL', 12));

    expect(stored).toEqual({ prefix: 'AL', correlative: 12 });
    expect(stored).not.toBeInstanceOf(FlightCode);
  });

  it('rebuilds a FlightCode from the parsed json Postgres returns', () => {
    const code: unknown = flightCodeTransformer.from({
      prefix: 'AL',
      correlative: 12,
    });

    expect(code).toBeInstanceOf(FlightCode);
    expect(String(code)).toBe('AL12');
  });

  it('rebuilds a FlightCode from the json text SQLite returns', () => {
    const code: unknown = flightCodeTransformer.from(
      '{"prefix":"AL","correlative":12}',
    );

    expect(String(code)).toBe('AL12');
  });

  it('keeps null as null', () => {
    expect(flightCodeTransformer.to(null)).toBeNull();
    expect(flightCodeTransformer.from(null)).toBeNull();
  });
});
