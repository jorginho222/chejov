import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { Airline } from '../airlines/entities/airline.entity';
import { CreateFlightDto } from './dto/create.flight.dto';
import { AirplanesService } from '../airplanes/airplanes.service';
import { FlightStatus } from './types/flight.status';
import { FlightCode } from './valueObjects/flight.code';
import { UpdateFlightScheduleDto } from './dto/update.flight.schedule.dto';
import { UpdateFlightStatusDto } from './dto/update.flight.status.dto';
import { isUniqueViolation } from '../shared/common/database.errors';

@Injectable()
export class FlightsUpsertService {
  constructor(
    private readonly airplaneService: AirplanesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(flightDto: CreateFlightDto): Promise<Flight> {
    const airplaneSearch = await this.airplaneService.search({
      where: {
        id: flightDto.airplane.id,
      },
    });
    if (airplaneSearch.length === 0) throw new Error('Airplane not found');

    return await this.dataSource.transaction(async (manager) => {
      // Locking the airline makes concurrent creations for the same airline
      // wait here, so two flights can't read the same last correlative.
      const airline = await manager.findOne(Airline, {
        where: { id: flightDto.airline.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!airline) throw new Error('Airline not found');

      const lastCorrelative = await this.getLastCodeCorrelative(
        manager,
        airline.code,
      );

      const flight = manager.create(Flight, {
        id: flightDto.id,
        code: new FlightCode(airline.code, lastCorrelative + 1),
        airline,
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

      try {
        return await manager.save(flight);
      } catch (error) {
        // The airline lock makes this rare, but a flight under another
        // airline can hold the same prefix, e.g. after an airline code change.
        if (isUniqueViolation(error, 'UQ_flight_code')) {
          throw new ConflictException(
            `Flight code ${flight.code.toString()} is already taken`,
          );
        }
        throw error;
      }
    });
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

  private async getLastCodeCorrelative(
    manager: EntityManager,
    prefix: string,
  ): Promise<number> {
    const result = await manager
      .createQueryBuilder(Flight, 'flight')
      .select("MAX((flight.code ->> 'correlative')::int)", 'last')
      .where("flight.code ->> 'prefix' = :prefix", { prefix })
      .getRawOne<{ last: number | null }>();

    return Number(result?.last ?? 0);
  }

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
