import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindManyOptions,
  FindOperator,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw,
  Repository,
} from 'typeorm';
import { Flight } from './entities/flight.entity';
import { SearchFlightsDto } from './dto/search.flights.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class FlightsSearchService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
  ) {}

  async search(criteria: FindManyOptions<Flight>) {
    return await this.flightRepository.find(criteria);
  }

  async searchFlights(searchDto: SearchFlightsDto): Promise<Flight[]> {
    const page = searchDto.page ?? DEFAULT_PAGE;
    const limit = searchDto.limit ?? DEFAULT_LIMIT;

    return await this.search({
      where: this.buildSearchWhere(searchDto),
      relations: { airline: true },
      order: { departure: 'ASC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getLastCodeCorrelative(prefixSearch: string): Promise<number | null> {
    const searchLastCriteria: FindManyOptions<Flight> = {
      where: {
        code: Raw((columnAlias) => `${columnAlias}->>'prefix' = :prefix`, {
          prefix: prefixSearch,
        }),
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

  private buildSearchWhere(
    searchDto: SearchFlightsDto,
  ): FindOptionsWhere<Flight> {
    const { origin, destination, status, airlineCode } = searchDto;
    const where: FindOptionsWhere<Flight> = {};

    if (origin) where.origin = origin;
    if (destination) where.destination = destination;
    if (status) where.status = status;
    if (airlineCode) where.airline = { code: airlineCode };

    const departure = this.buildDepartureRange(searchDto);
    if (departure) where.departure = departure;

    return where;
  }

  private buildDepartureRange({
    departureFrom,
    departureTo,
  }: SearchFlightsDto): FindOperator<Date> | undefined {
    if (departureFrom && departureTo) {
      if (departureFrom > departureTo) {
        throw new BadRequestException(
          'departureFrom must not be after departureTo',
        );
      }
      return Between(departureFrom, departureTo);
    }
    if (departureFrom) return MoreThanOrEqual(departureFrom);
    if (departureTo) return LessThanOrEqual(departureTo);

    return undefined;
  }
}
