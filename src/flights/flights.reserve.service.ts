import { Injectable } from '@nestjs/common';
import { Flight } from './entities/flight.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Passenger } from '../passengers/entities/passenger.entity';
import { AirplaneSeat } from './valueObjects/airplane.seat';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightReservedEvent } from './events/flight.reserved.event';

@Injectable()
export class FlightsReserveService {
  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(Passenger)
    private passengerRepository: Repository<Passenger>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async reserveSeat(seat: AirplaneSeat, flightId: string) {
    if (!seat.passengerId) {
      throw new Error('Need a passenger to reserve a seat');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const flightSearch = await this.flightRepository.find({
        where: { id: flightId },
        relations: ['passengers'],
      });
      const flight = flightSearch[0];
      const passengerSearch = await this.passengerRepository.find({
        where: { id: seat.passengerId },
        relations: ['flights'],
      });
      const passenger = passengerSearch[0];

      flight.reserveSeat(seat, passenger);
      passenger.flights.push(flight);

      await this.flightRepository.save(flight);
      await this.passengerRepository.save(passenger);

      this.eventEmitter.emit(
        'flight.reserved',
        new FlightReservedEvent(flightId, seat),
      );
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
