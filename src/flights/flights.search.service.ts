import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { FindManyOptions, Raw, Repository } from 'typeorm';

@Injectable()
export class FlightsSearchService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
  ) {}

  async search(criteria: FindManyOptions<Flight>) {
    return await this.flightRepository.find(criteria);
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
}
