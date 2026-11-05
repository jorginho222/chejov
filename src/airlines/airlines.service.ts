import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Airline } from './entities/airline.entity';
import { AirlineDto } from './dto/airline.dto';

// Postgres error code for a row still referenced by a foreign key
const FOREIGN_KEY_VIOLATION = '23503';

@Injectable()
export class AirlinesService {
  constructor(
    @InjectRepository(Airline)
    private readonly airlineRepository: Repository<Airline>,
  ) {}

  async create(airlineDto: AirlineDto): Promise<void> {
    const airline = this.airlineRepository.create(airlineDto);

    await this.airlineRepository.save(airline);
  }

  async findAll(): Promise<Airline[]> {
    return await this.airlineRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Airline> {
    const airline = await this.airlineRepository.findOneBy({ id });
    if (!airline) {
      throw new NotFoundException(`Airline ${id} not found`);
    }

    return airline;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    try {
      await this.airlineRepository.delete(id);
    } catch (error) {
      if (this.isForeignKeyViolation(error)) {
        throw new ConflictException(
          `Airline ${id} has flights and cannot be deleted`,
        );
      }
      throw error;
    }
  }

  private isForeignKeyViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as { code?: string } | undefined;
    return driverError?.code === FOREIGN_KEY_VIOLATION;
  }
}
