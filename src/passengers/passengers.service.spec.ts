import { Test, TestingModule } from '@nestjs/testing';
import { PassengersService } from './passengers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Passenger } from './entities/passenger.entity';
import { Repository } from 'typeorm';

describe('PassengerService', () => {
  let service: PassengersService;
  let passengerRepository: Repository<Passenger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassengersService,
        {
          provide: getRepositoryToken(Passenger),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PassengersService>(PassengersService);
    passengerRepository = module.get<Repository<Passenger>>(
      getRepositoryToken(Passenger),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
