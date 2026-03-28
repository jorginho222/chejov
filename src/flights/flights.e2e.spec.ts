import { Test, TestingModule } from '@nestjs/testing';
import { CreateFlightDto } from './dto/create.flight.dto';
import { v4 as uuidV4 } from 'uuid';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { FlightStatus } from './types/flight.status';
import { FlightsController } from './flights.controller';
import { FlightsUpsertService } from './flights.upsert.service';
import { FlightsSearchService } from './flights.search.service';
import { FlightsReserveService } from './flights.reserve.service';
import { Flight } from './entities/flight.entity';
import { Passenger } from '../passengers/entities/passenger.entity';
import { AirplanesModule } from '../airplanes/airplanes.module';
import ormConfigTest from '../../ormConfigTest';

describe('FlightsController', () => {
  let app: INestApplication;

  const airplaneDto = {
    id: uuidV4(),
    brand: 'Boeing',
    model: '737',
    passengersCapacity: 120,
    seatsConfig: [
      { columnsQuantity: 4, rowsQuantity: 10, class: 'firstClass' },
      { columnsQuantity: 6, rowsQuantity: 20, class: 'economicClass' },
    ],
  };

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
    flightPrices: [
      {
        class: 'firstClass',
        price: 1000,
      },
      {
        class: 'economicClass',
        price: 500,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfigTest),
        TypeOrmModule.forFeature([Flight, Passenger]),
        AirplanesModule,
      ],
      controllers: [FlightsController],
      providers: [
        FlightsUpsertService,
        FlightsSearchService,
        {
          provide: FlightsReserveService,
          useValue: {
            reserveSeat: jest.fn(),
            cancelSeatReservation: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {});

  it('POST /flights - should create a flight', async () => {
    await request(app.getHttpServer())
      .post('/airplanes')
      .send(airplaneDto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/flights')
      .send(flightDto)
      .expect(201);

    expect(response.body).toMatchObject({
      id: flightDto.id,
      origin: flightDto.origin,
      destination: flightDto.destination,
      airplane: {
        ...flightDto.airplane,
        imageUrl: '',
      },
      departure: flightDto.departure.toISOString(),
      arrival: flightDto.arrival.toISOString(),
      code: {
        prefix: flightDto.airline.code,
        correlative: 1,
      },
      passengers: [],
      status: FlightStatus.Scheduled,
      flightPrices: flightDto.flightPrices,
    });
  });
});
