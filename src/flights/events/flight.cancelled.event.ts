import { AirplaneSeat } from '../valueObjects/airplane.seat';

export class FlightCancelledEvent {
  constructor(
    public readonly flightId: string,
    public readonly seat: AirplaneSeat,
  ) {}
}
