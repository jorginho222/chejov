import { Test, TestingModule } from '@nestjs/testing';
import { PassengerDto } from './dto/passenger.dto';
import { v4 as uuidV4 } from 'uuid';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfigTest from '../../ormConfigTest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PassengersModule } from './passengers.module';
import * as request from 'supertest';

describe('PassengersController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassengersModule, TypeOrmModule.forRoot(ormConfigTest)],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true })); // Apply ValidationPipe
    await app.init();
  });

  it('should save a passenger', async () => {
    const passengerDto: PassengerDto = {
      id: uuidV4(),
      documentNumber: '123456789',
      name: 'Ramon',
      lastName: 'Diaz',
    };

    await request(app.getHttpServer())
      .post('/passengers')
      .send(passengerDto)
      .expect(201);
  });
});
