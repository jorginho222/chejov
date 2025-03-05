import { Test, TestingModule } from '@nestjs/testing';
import { CreateAirplaneDto } from './dto/create.airplane.dto';
import { v4 as uuidV4 } from 'uuid';
import { AirplanesModule } from './airplanes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfigTest from '../../ormConfigTest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

describe('AirplanesFeature', () => {
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
    const airplaneDto: CreateAirplaneDto = {
      id: uuidV4(),
      brand: 'Airbus',
      model: 'A111',
      passengersCapacity: 160,
      seatsConfig: [
        { columnsQuantity: 4, rowsQuantity: 10, class: 'firstClass' },
        { columnsQuantity: 6, rowsQuantity: 20, class: 'economicClass' },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/airplanes')
      .send(airplaneDto)
      .expect(201);
  });

  it('should throw a dto validation exception', async () => {
    const airplaneDto: CreateAirplaneDto = {
      id: 'uuidV4()',
      brand: 'a',
      model: 'A111',
      passengersCapacity: 160,
      seatsConfig: [
        { columnsQuantity: 4, rowsQuantity: 10, class: 'firstClass' },
        { columnsQuantity: 6, rowsQuantity: 20, class: 'economicClass' },
      ],
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/airplanes')
      .send(airplaneDto)
      .expect(400);
  });
});
