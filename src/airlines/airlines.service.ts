import { Injectable } from '@nestjs/common';
import { AirlineDto } from './dto/airline.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Airline } from './entities/airline.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AirlinesService {
  constructor(
    @InjectRepository(Airline)
    private readonly airlineRepository: Repository<Airline>,
  ) {}

  async create(airlineDto: AirlineDto) {
    const airline = this.airlineRepository.create(airlineDto);

    await this.airlineRepository.save(airline);
  }
}
