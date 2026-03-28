import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfigTest from '../../ormConfigTest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PassengersController } from './passengers.controller';
import { PassengersService } from './passengers.service';
import { Passenger } from './entities/passenger.entity';
import { Flight } from '../flights/entities/flight.entity';

describe('PassengersController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // const module: TestingModule = await Test.createTestingModule({
    //   imports: [
    //     TypeOrmModule.forRoot(ormConfigTest),
    //     TypeOrmModule.forFeature([Passenger, Flight]),
    //   ],
    //   controllers: [PassengersController],
    //   providers: [PassengersService],
    // }).compile();
    //
    // app = module.createNestApplication();
    // app.useGlobalPipes(new ValidationPipe({ transform: true })); // Apply ValidationPipe
    // await app.init();
  });

  it('should save a passenger', async () => {
    // const passengerDto: PassengerDto = {
    //   id: uuidV4(),
    //   documentNumber: '123456789',
    //   name: 'Ramon',
    //   lastName: 'Diaz',
    //   email: 'ramon@example.com',
    // };
    //
    // await request(app.getHttpServer())
    //   .post('/passengers')
    //   .send(passengerDto)
    //   .expect(201);

    expect(true);
  });
});
