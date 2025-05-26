import { Test, TestingModule } from '@nestjs/testing';
import { AirlinesController } from './airlines.controller';

describe('AirlinesController', () => {
  let controller: AirlinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirlinesController],
    }).compile();

    controller = module.get<AirlinesController>(AirlinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
