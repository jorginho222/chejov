import { Test, TestingModule } from '@nestjs/testing';
import { CreateFlightDto } from './dto/create.flight.dto';
import { v4 as uuidV4 } from 'uuid';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { FlightStatus } from './types/flight.status';
import { FlightsModule } from './flights.module';
import { AirplanesModule } from '../airplanes/airplanes.module';
import ormConfigTest from '../../ormConfigTest';

describe('FlightsController', () => {
  let app: INestApplication;

  const airplaneDto = {
    id: uuidV4(),
    brand: 'Boeing',
    model: '737',
    passengersCapacity: 200,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        FlightsModule,
        AirplanesModule,
        TypeOrmModule.forRoot(ormConfigTest),
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true })); // Apply ValidationPipe
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {});

  it('POST /flights - should create a flight', async () => {
    const currentDate = new Date();
    const twoHoursLater = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);
    const flightDto: CreateFlightDto = {
      id: uuidV4(),
      airline: { name: 'Air Canada', code: 'AC' },
      origin: 'New York',
      destination: 'London',
      airplane: airplaneDto,
      departure: currentDate,
      arrival: twoHoursLater,
    };

    await request(app.getHttpServer())
      .post('/airplanes')
      .send(airplaneDto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/flights')
      .send(flightDto)
      .expect(201);

    expect(response.body).toEqual({
      id: flightDto.id,
      origin: flightDto.origin,
      destination: flightDto.destination,
      airplane: flightDto.airplane,
      departure: flightDto.departure,
      arrival: flightDto.arrival,
      code: {
        prefix: flightDto.airline.code,
        correlative: 1,
      },
      passengers: [],
      status: FlightStatus.Scheduled,
    });
  });
});
