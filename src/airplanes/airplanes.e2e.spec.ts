import { Test, TestingModule } from '@nestjs/testing';
import { AirplaneDto } from './dto/airplane.dto';
import { v4 as uuidV4 } from 'uuid';
import { AirplanesModule } from './airplanes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfigTest from '../../ormConfigTest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

describe('AirplanesController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AirplanesModule, TypeOrmModule.forRoot(ormConfigTest)],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true })); // Apply ValidationPipe
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should save an airplane', async () => {
    const airplaneDto: AirplaneDto = {
      id: uuidV4(),
      brand: 'Airbus',
      model: 'A111',
      passengersCapacity: 50,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/airplanes')
      .send(airplaneDto)
      .expect(201);
  });

  it('should throw a dto validation exception', async () => {
    const airplaneDto: AirplaneDto = {
      id: 'uuidV4()',
      brand: 'a',
      model: 'A111',
      passengersCapacity: 50,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/airplanes')
      .send(airplaneDto)
      .expect(400);
  });
});
