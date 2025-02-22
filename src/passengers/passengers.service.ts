import { Injectable } from '@nestjs/common';
import { PassengerDto } from './dto/passenger.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Passenger } from './entities/passenger.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PassengersService {
  constructor(
    @InjectRepository(Passenger)
    private readonly passengerRepository: Repository<Passenger>,
  ) {}

  public async get() {
    return await this.passengerRepository.find({
      relations: ['flights'],
    });
  }

  public async upsert(passengerDto: PassengerDto) {
    const passenger = this.passengerRepository.create(passengerDto);
    return this.passengerRepository.save(passenger);
  }
}
