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
import { AirplaneSeat } from './valueObjects/airplane.seat';
import { PassengerDto } from '../passengers/dto/passenger.dto';

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
  const passengerDto: PassengerDto = {
    id: uuidV4(),
    documentNumber: '123456789',
    name: 'Ramon',
    lastName: 'Diaz',
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
    await request(app.getHttpServer())
      .post('/airplanes')
      .send(airplaneDto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/flights')
      .send(flightDto)
      .expect(201);

    expect(response.body).toContain({
      id: flightDto.id,
      origin: flightDto.origin,
      destination: flightDto.destination,
      airplane: flightDto.airplane,
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

  it('should reserve a flight seat', async () => {
    await request(app.getHttpServer()).post('/passengers').send(passengerDto);
    await request(app.getHttpServer()).post('/airplanes').send(airplaneDto);
    await request(app.getHttpServer()).post('/flights').send(flightDto);

    const seat: AirplaneSeat = {
      class: 'firstClass',
      column: 'A',
      row: 1,
      passengerId: passengerDto.id,
    };

    await request(app.getHttpServer())
      .put(`/flights/${flightDto.id}/reserve`)
      .send(seat)
      .expect(201);
  });
});
