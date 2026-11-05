import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FlightsUpsertService } from './flights.upsert.service';
import { Flight } from './entities/flight.entity';
import { Airline } from '../airlines/entities/airline.entity';
import { AirplanesService } from '../airplanes/airplanes.service';
import { FlightsSearchService } from './flights.search.service';
import { FlightStatus } from './types/flight.status';
import { UpdateFlightScheduleDto } from './dto/update.flight.schedule.dto';
import { UpdateFlightStatusDto } from './dto/update.flight.status.dto';

describe('FlightsUpsertService', () => {
  let service: FlightsUpsertService;
  let manager: { findOne: jest.Mock; save: jest.Mock };
  let transaction: jest.Mock;
  let repositorySave: jest.Mock;
  let flight: Flight;

  const flightId = 'flight-id';
  const departure = new Date('2030-01-01T10:00:00Z');
  const arrival = new Date('2030-01-01T12:00:00Z');

  const statusDto = {
    id: flightId,
    status: FlightStatus.Delayed,
  } as UpdateFlightStatusDto;

  const scheduleDto = (newDeparture: Date, newArrival: Date) =>
    ({
      id: flightId,
      departure: newDeparture,
      arrival: newArrival,
    }) as UpdateFlightScheduleDto;

  beforeEach(async () => {
    flight = new Flight();
    flight.status = FlightStatus.Scheduled;
    flight.departure = departure;
    flight.arrival = arrival;

    manager = {
      findOne: jest.fn().mockResolvedValue(flight),
      save: jest.fn((saved: Flight) => Promise.resolve(saved)),
    };
    transaction = jest.fn((work: (m: typeof manager) => Promise<Flight>) =>
      work(manager),
    );
    repositorySave = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsUpsertService,
        {
          provide: getRepositoryToken(Flight),
          useValue: { save: repositorySave },
        },
        { provide: getRepositoryToken(Airline), useValue: {} },
        { provide: FlightsSearchService, useValue: {} },
        { provide: AirplanesService, useValue: {} },
        { provide: DataSource, useValue: { transaction } },
      ],
    }).compile();

    service = module.get<FlightsUpsertService>(FlightsUpsertService);
  });

  const expectFlightLockedAndSavedInTransaction = () => {
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(manager.findOne).toHaveBeenCalledWith(Flight, {
      where: { id: flightId },
      lock: { mode: 'pessimistic_write' },
    });
    expect(manager.save).toHaveBeenCalledWith(flight);
    expect(repositorySave).not.toHaveBeenCalled();
  };

  describe('updateStatus', () => {
    it('locks the flight, then saves the new status in one transaction', async () => {
      const result = await service.updateStatus(statusDto);

      expectFlightLockedAndSavedInTransaction();
      expect(result).toBe(flight);
      expect(result.status).toBe(FlightStatus.Delayed);
    });

    it('applies the change to the flight read under the lock', async () => {
      const savedStatuses: FlightStatus[] = [];
      manager.save.mockImplementation((saved: Flight) => {
        savedStatuses.push(saved.status);
        return Promise.resolve(saved);
      });

      await service.updateStatus(statusDto);

      expect(savedStatuses).toEqual([FlightStatus.Delayed]);
      expect(manager.findOne.mock.invocationCallOrder[0]).toBeLessThan(
        manager.save.mock.invocationCallOrder[0],
      );
    });

    it('does not save when the flight does not exist', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.updateStatus(statusDto)).rejects.toThrow(
        'Flight not found',
      );

      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  describe('updateSchedule', () => {
    it('locks the flight, then saves a later schedule as delayed', async () => {
      const newDeparture = new Date('2030-01-01T11:00:00Z');
      const newArrival = new Date('2030-01-01T13:00:00Z');

      const result = await service.updateSchedule(
        scheduleDto(newDeparture, newArrival),
      );

      expectFlightLockedAndSavedInTransaction();
      expect(result.departure).toBe(newDeparture);
      expect(result.arrival).toBe(newArrival);
      expect(result.status).toBe(FlightStatus.Delayed);
    });

    it('saves an earlier schedule as advanced', async () => {
      const result = await service.updateSchedule(
        scheduleDto(
          new Date('2030-01-01T09:00:00Z'),
          new Date('2030-01-01T11:00:00Z'),
        ),
      );

      expect(result.status).toBe(FlightStatus.Advanced);
    });

    it('does not save an invalid schedule', async () => {
      await expect(
        service.updateSchedule(
          scheduleDto(
            new Date('2030-01-01T15:00:00Z'),
            new Date('2030-01-01T11:00:00Z'),
          ),
        ),
      ).rejects.toThrow('Departure must be before arrival');

      expect(manager.save).not.toHaveBeenCalled();
    });

    it('does not save when the flight does not exist', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(
        service.updateSchedule(scheduleDto(departure, arrival)),
      ).rejects.toThrow('Flight not found');

      expect(manager.save).not.toHaveBeenCalled();
    });
  });
});
