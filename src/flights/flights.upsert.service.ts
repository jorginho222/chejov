import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { CreateFlightDto } from './dto/create.flight.dto';
import { AirplanesService } from '../airplanes/airplanes.service';
import { FlightStatus } from './types/flight.status';
import { FlightCode } from './valueObjects/flight.code';
import { UpdateFlightScheduleDto } from './dto/update.flight.schedule.dto';
import { FlightsSearchService } from './flights.search.service';
import { UpdateFlightStatusDto } from './dto/update.flight.status.dto';

@Injectable()
export class FlightsUpsertService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    private readonly flightSearchService: FlightsSearchService,
    private readonly airplaneService: AirplanesService,
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

    const flight = this.flightRepository.create({
      id: flightDto.id,
      code: currentCode,
      origin: flightDto.origin,
      destination: flightDto.destination,
      airplane: airplaneSearch[0],
      departure: flightDto.departure,
      arrival: flightDto.arrival,
      passengers: [],
      status: FlightStatus.Scheduled,
    });

    flight.validate();
    flight.setSeats();

    return await this.flightRepository.save(flight);
  }

  async updateSchedule(flightDto: UpdateFlightScheduleDto) {
    const flightSearch = await this.flightSearchService.search({
      where: {
        id: flightDto.id,
      },
    });

    if (flightSearch.length === 0) throw new Error('Flight not found');
    const flight = flightSearch[0];

    flight.setSchedule(flightDto.departure, flightDto.arrival);

    return await this.flightRepository.save(flight);
  }

  async updateStatus(flightDto: UpdateFlightStatusDto) {
    const flightSearch = await this.flightSearchService.search({
      where: {
        id: flightDto.id,
      },
    });

    if (flightSearch.length === 0) throw new Error('Flight not found');
    const flight = flightSearch[0];

    flight.setStatus(flightDto.status as FlightStatus);

    return await this.flightRepository.save(flight);
  }
}
