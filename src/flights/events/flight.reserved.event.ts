import { AirplaneSeat } from '../valueObjects/airplane.seat';

export class FlightReservedEvent {
  constructor(
    public readonly flightId: string,
    public readonly seat: AirplaneSeat,
  ) {}
}
