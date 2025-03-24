import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { Airplane } from './entities/airplane.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAirplaneDto } from './dto/create.airplane.dto';
import { S3Service } from '../shared/s3/s3.service';

@Injectable()
export class AirplanesService {
  constructor(
    @InjectRepository(Airplane)
    private readonly airplaneRepository: Repository<Airplane>,
    private s3Service: S3Service,
  ) {}

  async search(criteria: FindManyOptions<Airplane>) {
    return await this.airplaneRepository.find(criteria);
  }

  async upsert(airplaneDto: CreateAirplaneDto) {
    const airplane = this.airplaneRepository.create(airplaneDto);
    return await this.airplaneRepository.save(airplane);
  }

  async uploadFile(file: Express.Multer.File, airplaneId: string) {
    const key = `${file.fieldname} ${Date.now()}`;

    const fileUrl = await this.s3Service.uploadFile(file, key);
    await this.airplaneRepository.update(
      { id: airplaneId },
      { imageUrl: fileUrl },
    );
  }
}
