import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, FindManyOptions, Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { CreateFlightDto } from './dto/create.flight.dto';
import { AirplanesService } from '../airplanes/airplanes.service';
import { FlightStatus } from './types/flight.status';
import { FlightCode } from './valueObjects/FlightCode';
import { UpdateFlightDto } from './dto/update.flight.dto';

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    private readonly airplaneService: AirplanesService,
  ) {}

  async search(criteria: FindManyOptions<Flight>) {
    return await this.flightRepository.find(criteria);
  }

  async getLastCodeCorrelative(prefixSearch: string): Promise<number | null> {
    const searchLastCriteria: FindManyOptions<Flight> = {
      where: {
        code: Equal({ prefix: prefixSearch }),
      },
      order: {
        code: 'DESC',
      },
      take: 1,
    };
    const lastFlightSearch: Flight[] = await this.search(searchLastCriteria);
    if (lastFlightSearch.length === 0) return null;

    return lastFlightSearch[0].code.getCorrelative();
  }

  async create(flightDto: CreateFlightDto) {
    const lastCorrelative = await this.getLastCodeCorrelative(
      flightDto.airline.code,
    );
    const currentCode = new FlightCode(
      flightDto.airline.code,
      lastCorrelative ? lastCorrelative + 1 : 1,
    );

    const airplaneSearch = await this.airplaneService.search({
      where: {
        id: flightDto.airplane.id,
      },
    });
    if (airplaneSearch.length === 0) throw new Error('Airplane not found');

    const flight = this.flightRepository.create({
      id: flightDto.id,
      code: currentCode,
      from: flightDto.from,
      to: flightDto.to,
      airplane: airplaneSearch[0],
      departure: flightDto.departure,
      arrival: flightDto.arrival,
      passengers: [],
      status: FlightStatus.Scheduled,
    });

    return await this.flightRepository.save(flight);
  }

  async update(flightDto: UpdateFlightDto) {
    const flightSearch = await this.search({
      where: {
        id: flightDto.id,
      },
    });

    if (flightSearch.length === 0) throw new Error('Flight not found');
    const flight = flightSearch[0];

    flight.setStatus(flightDto.status as FlightStatus);
    flight.setDeparture(new Date(flightDto.departure));
    flight.setArrival(new Date(flightDto.arrival));

    return await this.flightRepository.save(flight);
  }
}
