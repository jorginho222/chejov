import { Test, TestingModule } from '@nestjs/testing';
import { AirlinesController } from './airlines.controller';
import { AirlinesService } from './airlines.service';
import { AirlinesImportService } from './airlines.import.service';

describe('AirlinesController', () => {
  let controller: AirlinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirlinesController],
      providers: [
        { provide: AirlinesService, useValue: {} },
        { provide: AirlinesImportService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AirlinesController>(AirlinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
