import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Airline } from './entities/airline.entity';
import { AirlinesService } from './airlines.service';

const AIRLINE_ID = '123e4567-e89b-42d3-a456-426614174000';

const foreignKeyError = (code: string): QueryFailedError =>
  new QueryFailedError('DELETE FROM "airline"', [], {
    name: 'error',
    message: 'violates foreign key constraint',
    code,
  } as Error);

describe('AirlinesService', () => {
  let service: AirlinesService;
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirlinesService,
        { provide: getRepositoryToken(Airline), useValue: repository },
      ],
    }).compile();

    service = module.get(AirlinesService);
  });

  describe('findAll', () => {
    it('lists airlines ordered by name', async () => {
      const airlines = [{ id: AIRLINE_ID }] as Airline[];
      repository.find.mockResolvedValue(airlines);

      await expect(service.findAll()).resolves.toBe(airlines);
      expect(repository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });
  });

  describe('findOne', () => {
    it('returns the airline', async () => {
      const airline = { id: AIRLINE_ID } as Airline;
      repository.findOneBy.mockResolvedValue(airline);

      await expect(service.findOne(AIRLINE_ID)).resolves.toBe(airline);
    });

    it('throws NotFoundException for an unknown id', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(AIRLINE_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes an existing airline', async () => {
      repository.findOneBy.mockResolvedValue({ id: AIRLINE_ID });

      await service.remove(AIRLINE_ID);

      expect(repository.delete).toHaveBeenCalledWith(AIRLINE_ID);
    });

    it('throws NotFoundException and deletes nothing for an unknown id', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(AIRLINE_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('throws ConflictException when flights still use the airline', async () => {
      repository.findOneBy.mockResolvedValue({ id: AIRLINE_ID });
      repository.delete.mockRejectedValue(foreignKeyError('23503'));

      await expect(service.remove(AIRLINE_ID)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rethrows other database errors', async () => {
      const error = foreignKeyError('57014');
      repository.findOneBy.mockResolvedValue({ id: AIRLINE_ID });
      repository.delete.mockRejectedValue(error);

      await expect(service.remove(AIRLINE_ID)).rejects.toBe(error);
    });
  });
});
