import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Not, QueryFailedError } from 'typeorm';
import { Airplane } from './entities/airplane.entity';
import { Flight } from '../flights/entities/flight.entity';
import { AirplanesService } from './airplanes.service';
import { S3Service } from '../shared/s3/s3.service';
import { CreateAirplaneDto } from './dto/create.airplane.dto';

const AIRPLANE_ID = '123e4567-e89b-42d3-a456-426614174000';

const databaseError = (code: string): QueryFailedError =>
  new QueryFailedError('query', [], {
    name: 'error',
    message: 'database error',
    code,
  } as Error);

describe('AirplanesService', () => {
  let service: AirplanesService;
  const airplaneRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    existsBy: jest.fn(),
    findOneByOrFail: jest.fn(),
  };
  const flightRepository = { find: jest.fn() };
  const s3Service = { uploadFile: jest.fn(), deleteFile: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirplanesService,
        { provide: getRepositoryToken(Airplane), useValue: airplaneRepository },
        { provide: getRepositoryToken(Flight), useValue: flightRepository },
        { provide: S3Service, useValue: s3Service },
      ],
    }).compile();

    service = module.get(AirplanesService);
  });

  describe('upsert', () => {
    const dto = {
      id: AIRPLANE_ID,
      model: 'A320neo',
      passengersCapacity: 6,
      seatsConfig: [{ class: 'economy', rowsQuantity: 1, columnsQuantity: 6 }],
    } as CreateAirplaneDto;

    beforeEach(() => {
      airplaneRepository.create.mockImplementation((value: object) =>
        Object.assign(new Airplane(), value),
      );
      airplaneRepository.save.mockImplementation((value: Airplane) =>
        Promise.resolve(value),
      );
    });

    it('saves an airplane whose model no other airplane uses', async () => {
      airplaneRepository.existsBy.mockResolvedValue(false);

      await service.upsert(dto);

      expect(airplaneRepository.existsBy).toHaveBeenCalledWith({
        model: 'A320neo',
        id: Not(AIRPLANE_ID),
      });
      expect(airplaneRepository.save).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException and saves nothing when the model is taken', async () => {
      airplaneRepository.existsBy.mockResolvedValue(true);

      await expect(service.upsert(dto)).rejects.toThrow(
        new ConflictException('An airplane with model A320neo already exists'),
      );
      expect(airplaneRepository.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when another request takes the model first', async () => {
      airplaneRepository.existsBy.mockResolvedValue(false);
      airplaneRepository.save.mockRejectedValue(databaseError('23505'));

      await expect(service.upsert(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      airplaneRepository.findOneBy.mockResolvedValue({
        id: AIRPLANE_ID,
        imageUrl: '',
      });
      flightRepository.find.mockResolvedValue([]);
    });

    it('deletes an airplane no flight uses', async () => {
      await service.remove(AIRPLANE_ID);

      expect(airplaneRepository.delete).toHaveBeenCalledWith(AIRPLANE_ID);
    });

    it('throws NotFoundException and deletes nothing for an unknown id', async () => {
      airplaneRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(AIRPLANE_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(airplaneRepository.delete).not.toHaveBeenCalled();
    });

    it('names the airlines whose flights use the airplane, once each', async () => {
      flightRepository.find.mockResolvedValue([
        { airline: { name: 'Zulu Air' } },
        { airline: { name: 'Alpha Air' } },
        { airline: { name: 'Zulu Air' } },
        { airline: null },
      ]);

      await expect(service.remove(AIRPLANE_ID)).rejects.toThrow(
        new ConflictException(
          `Airplane ${AIRPLANE_ID} is used by 4 flight(s) of Alpha Air, Zulu Air and cannot be deleted`,
        ),
      );
      expect(airplaneRepository.delete).not.toHaveBeenCalled();
    });

    it('throws ConflictException when a flight is created after the check', async () => {
      airplaneRepository.delete.mockRejectedValue(databaseError('23503'));

      await expect(service.remove(AIRPLANE_ID)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rethrows other database errors', async () => {
      const error = databaseError('08006');
      airplaneRepository.delete.mockRejectedValue(error);

      await expect(service.remove(AIRPLANE_ID)).rejects.toBe(error);
    });

    it('still succeeds when the image cannot be deleted from S3', async () => {
      airplaneRepository.findOneBy.mockResolvedValue({
        id: AIRPLANE_ID,
        imageUrl: 'https://bucket.s3.region.amazonaws.com/file_123',
      });
      s3Service.deleteFile.mockRejectedValue(new Error('S3 is down'));

      await expect(service.remove(AIRPLANE_ID)).resolves.toBeUndefined();
      expect(s3Service.deleteFile).toHaveBeenCalledWith('file_123');
    });
  });
});
