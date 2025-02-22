import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { Airplane } from './entities/airplane.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AirplaneDto } from './dto/airplane.dto';

@Injectable()
export class AirplanesService {
  constructor(
    @InjectRepository(Airplane)
    private readonly airplaneRepository: Repository<Airplane>,
  ) {}

  async search(criteria: FindManyOptions<Airplane>) {
    return await this.airplaneRepository.find(criteria);
  }

  async upsert(airplaneDto: AirplaneDto) {
    const airplane = this.airplaneRepository.create(airplaneDto);
    return await this.airplaneRepository.save(airplane);
  }
}
