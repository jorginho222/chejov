import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { CreateFlightDto } from './dto/create.flight.dto';
import { AirplanesService } from '../airplanes/airplanes.service';
import { FlightStatus } from './types/flight.status';
import { FlightCode } from './valueObjects/flight.code';
import { UpdateFlightScheduleDto } from './dto/update.flight.schedule.dto';
import { FlightsSearchService } from './flights.search.service';
import { UpdateFlightStatusDto } from './dto/update.flight.status.dto';
import { Airline } from '../airlines/entities/airline.entity';

@Injectable()
export class FlightsUpsertService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    @InjectRepository(Airline)
    private readonly airlineRepository: Repository<Airline>,
    private readonly flightSearchService: FlightsSearchService,
    private readonly airplaneService: AirplanesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(flightDto: CreateFlightDto) {
    // const lastCorrelative =
    //   await this.flightSearchService.getLastCodeCorrelative(
    //     flightDto.airline.code,
    //   );
    const currentCode = new FlightCode(flightDto.airline.code, 1);

    const airplaneSearch = await this.airplaneService.search({
      where: {
        id: flightDto.airplane.id,
      },
    });
    if (airplaneSearch.length === 0) throw new Error('Airplane not found');

    const airlineSearch = await this.airlineRepository.findOne({
      where: {
        id: flightDto.airline.id,
      },
    });
    if (!airlineSearch) throw new Error('Airline not found');

    const flight = this.flightRepository.create({
      id: flightDto.id,
      code: currentCode,
      airline: airlineSearch,
      origin: flightDto.origin,
      destination: flightDto.destination,
      distance: flightDto.distance,
      airplane: airplaneSearch[0],
      departure: flightDto.departure,
      arrival: flightDto.arrival,
      passengers: [],
      orders: [],
      status: FlightStatus.Scheduled,
      basePrice: flightDto.basePrice,
    });

    flight.validate();
    flight.setSeats();

    return await this.flightRepository.save(flight);
  }

  async updateSchedule(flightDto: UpdateFlightScheduleDto) {
    return await this.updateLockedFlight(flightDto.id, (flight) => {
      flight.setSchedule(flightDto.departure, flightDto.arrival);
    });
  }

  async updateStatus(flightDto: UpdateFlightStatusDto) {
    return await this.updateLockedFlight(flightDto.id, (flight) => {
      flight.setStatus(flightDto.status as FlightStatus);
    });
  }

  // Saving writes back every column that differs from the database, including
  // seats. Without the lock, a reservation made between the read and the save
  // would be overwritten by the stale seats.
  private async updateLockedFlight(
    flightId: string,
    applyChange: (flight: Flight) => void,
  ): Promise<Flight> {
    return await this.dataSource.transaction(async (manager) => {
      const flight = await manager.findOne(Flight, {
        where: { id: flightId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!flight) throw new Error('Flight not found');

      applyChange(flight);

      return await manager.save(flight);
    });
  }
}
