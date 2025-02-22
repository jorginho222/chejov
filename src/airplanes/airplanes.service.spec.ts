import { Test, TestingModule } from '@nestjs/testing';
import { AirplanesService } from './airplanes.service';

describe('AirplanesService', () => {
  let service: AirplanesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirplanesService],
    }).compile();

    service = module.get<AirplanesService>(AirplanesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
