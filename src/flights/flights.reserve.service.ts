import { Injectable } from '@nestjs/common';
import { Flight } from './entities/flight.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Passenger } from '../passengers/entities/passenger.entity';
import { AirplaneSeat } from './valueObjects/airplane.seat';

@Injectable()
export class FlightsReserveService {
  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(Passenger)
    private passengerRepository: Repository<Passenger>,
  ) {}

  async reserveSeat(seat: AirplaneSeat, flightId: string) {
    if (!seat.passengerId) {
      throw new Error('Need a passenger to reserve a seat');
    }

    const passengerSearch = await this.passengerRepository.find({
      where: { id: seat.passengerId },
    });
    const flightSearch = await this.flightRepository.find({
      where: { id: flightId },
    });
    const flight = flightSearch[0];
    const passenger = passengerSearch[0];

    flight.reserveSeat(seat, passengerSearch[0]);
    await this.flightRepository.save(flight);

    passenger.flights.push(flight);
    await this.passengerRepository.save(passenger);
  }
}
