import { BadRequestException, Injectable } from '@nestjs/common';
import { Flight } from './entities/flight.entity';
import { DataSource, EntityManager } from 'typeorm';
import { Passenger } from '../passengers/entities/passenger.entity';
import { AirplaneSeat } from './valueObjects/airplane.seat';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightReservedEvent } from './events/flight.reserved.event';
import { FlightCancelledEvent } from './events/flight.cancelled.event';

@Injectable()
export class FlightsReserveService {
  constructor(
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async reserveSeat(seat: AirplaneSeat, flightId: string) {
    if (!seat.passengerId) {
      throw new BadRequestException('Need a passenger to reserve a seat');
    }
    const passengerId = seat.passengerId;

    await this.dataSource.transaction(async (manager) => {
      await this.lockFlight(manager, flightId);

      const flightSearch = await manager.find(Flight, {
        where: { id: flightId },
        relations: ['passengers'],
      });
      const flight = flightSearch[0];
      const passengerSearch = await manager.find(Passenger, {
        where: { id: passengerId },
        relations: ['flights'],
      });
      const passenger = passengerSearch[0];

      flight.reserveSeat(seat, passenger);
      passenger.flights.push(flight);

      await manager.save(flight);
      await manager.save(passenger);
    });

    // Emit after commit so subscribers never act on a rolled-back reservation
    this.eventEmitter.emit(
      'flight.reserved',
      new FlightReservedEvent(flightId, seat),
    );
  }

  async cancelSeatReservation(seat: AirplaneSeat, flightId: string) {
    if (!seat.passengerId) {
      throw new BadRequestException(
        'Need a passenger to cancel a seat reservation',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await this.lockFlight(manager, flightId);

      const flightSearch = await manager.find(Flight, {
        where: { id: flightId },
        relations: ['passengers'],
      });
      const flight = flightSearch[0];

      flight.cancelSeatReservation(seat);
      await manager.save(flight);
    });

    // Emit after commit so subscribers never act on a rolled-back cancellation
    this.eventEmitter.emit(
      'flight.cancelled',
      new FlightCancelledEvent(flightId, seat),
    );
  }

  // All seats live in one JSON column, so any two reservations on a flight
  // conflict. Locked separately because FOR UPDATE can't be applied to the
  // outer join used to load relations.
  private async lockFlight(
    manager: EntityManager,
    flightId: string,
  ): Promise<void> {
    await manager.findOne(Flight, {
      where: { id: flightId },
      lock: { mode: 'pessimistic_write' },
    });
  }
}
