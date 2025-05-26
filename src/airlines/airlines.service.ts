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
    const airline = this.airlineRepository.create({
      id: airlineDto.id,
      name: airlineDto.name,
      code: airlineDto.code,
    });

    await this.airlineRepository.save(airline);
  }
}
