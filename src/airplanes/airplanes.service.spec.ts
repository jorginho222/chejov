import { Test, TestingModule } from '@nestjs/testing';
import { AirplanesService } from './airplanes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Airplane } from './entities/airplane.entity';
import { S3Service } from '../shared/s3/s3.service';

describe('AirplanesService', () => {
  let service: AirplanesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirplanesService,
        {
          provide: getRepositoryToken(Airplane),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneByOrFail: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AirplanesService>(AirplanesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
