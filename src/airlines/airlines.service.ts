import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Airline } from './entities/airline.entity';
import { AirlineDto } from './dto/airline.dto';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '../shared/common/database.errors';

@Injectable()
export class AirlinesService {
  constructor(
    @InjectRepository(Airline)
    private readonly airlineRepository: Repository<Airline>,
  ) {}

  // Upserts by id, so saving an airline with its own code is allowed
  async create(airlineDto: AirlineDto): Promise<void> {
    await this.assertCodeIsFree(airlineDto.code, airlineDto.id);

    const airline = this.airlineRepository.create(airlineDto);

    try {
      await this.airlineRepository.save(airline);
    } catch (error) {
      // Another request may take the code between the check and the save
      if (isUniqueViolation(error)) {
        throw this.codeTaken(airlineDto.code);
      }
      throw error;
    }
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
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          `Airline ${id} has flights and cannot be deleted`,
        );
      }
      throw error;
    }
  }

  private async assertCodeIsFree(code: string, id: string): Promise<void> {
    const taken = await this.airlineRepository.existsBy({ code, id: Not(id) });
    if (taken) {
      throw this.codeTaken(code);
    }
  }

  private codeTaken(code: string): ConflictException {
    return new ConflictException(`An airline with code ${code} already exists`);
  }
}
