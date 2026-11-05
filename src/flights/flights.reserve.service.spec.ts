import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { FlightsReserveService } from './flights.reserve.service';
import { AirplaneSeat } from './valueObjects/airplane.seat';

describe('FlightsReserveService', () => {
  let service: FlightsReserveService;
  let manager: { findOne: jest.Mock; find: jest.Mock; save: jest.Mock };
  let transaction: jest.Mock;
  let emit: jest.Mock;
  let flight: {
    reserveSeat: jest.Mock;
    cancelSeatReservation: jest.Mock;
  };
  let passenger: { flights: unknown[] };

  const seat = {
    class: 'economic',
    column: 'a',
    row: 0,
    passengerId: 'passenger-id',
  } as AirplaneSeat;

  beforeEach(async () => {
    flight = { reserveSeat: jest.fn(), cancelSeatReservation: jest.fn() };
    passenger = { flights: [] };
    manager = {
      findOne: jest.fn().mockResolvedValue(flight),
      find: jest
        .fn()
        .mockResolvedValueOnce([flight])
        .mockResolvedValueOnce([passenger]),
      save: jest.fn().mockResolvedValue(undefined),
    };
    transaction = jest.fn((work: (m: typeof manager) => Promise<void>) =>
      work(manager),
    );
    emit = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsReserveService,
        { provide: DataSource, useValue: { transaction } },
        { provide: EventEmitter2, useValue: { emit } },
      ],
    }).compile();

    service = module.get<FlightsReserveService>(FlightsReserveService);
  });

  const expectFlightLockedBeforeRead = () => {
    expect(manager.findOne).toHaveBeenCalledWith(expect.anything(), {
      where: { id: 'flight-id' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(manager.findOne.mock.invocationCallOrder[0]).toBeLessThan(
      manager.find.mock.invocationCallOrder[0],
    );
  };

  describe('reserveSeat', () => {
    it('saves the flight and passenger in one transaction, then emits', async () => {
      await service.reserveSeat(seat, 'flight-id');

      expect(transaction).toHaveBeenCalledTimes(1);
      expectFlightLockedBeforeRead();
      expect(manager.save).toHaveBeenNthCalledWith(1, flight);
      expect(manager.save).toHaveBeenNthCalledWith(2, passenger);
      expect(emit).toHaveBeenCalledWith(
        'flight.reserved',
        expect.objectContaining({ flightId: 'flight-id', seat }),
      );
    });

    it('does not emit until the transaction has finished', async () => {
      let finishTransaction: () => void = () => undefined;
      transaction.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            finishTransaction = resolve;
          }),
      );

      const reservation = service.reserveSeat(seat, 'flight-id');
      await Promise.resolve();
      expect(emit).not.toHaveBeenCalled();

      finishTransaction();
      await reservation;
      expect(emit).toHaveBeenCalledTimes(1);
    });

    it('does not emit when a save fails', async () => {
      manager.save.mockRejectedValueOnce(new Error('save failed'));

      await expect(service.reserveSeat(seat, 'flight-id')).rejects.toThrow(
        'save failed',
      );

      expect(emit).not.toHaveBeenCalled();
    });

    it('rejects a seat without a passenger before opening a transaction', async () => {
      await expect(
        service.reserveSeat({ ...seat, passengerId: null }, 'flight-id'),
      ).rejects.toThrow(BadRequestException);

      expect(transaction).not.toHaveBeenCalled();
    });
  });

  describe('cancelSeatReservation', () => {
    it('saves the flight in one transaction, then emits', async () => {
      await service.cancelSeatReservation(seat, 'flight-id');

      expect(transaction).toHaveBeenCalledTimes(1);
      expectFlightLockedBeforeRead();
      expect(flight.cancelSeatReservation).toHaveBeenCalledWith(seat);
      expect(manager.save).toHaveBeenCalledWith(flight);
      expect(emit).toHaveBeenCalledWith(
        'flight.cancelled',
        expect.objectContaining({ flightId: 'flight-id', seat }),
      );
    });

    it('does not emit when the save fails', async () => {
      manager.save.mockRejectedValueOnce(new Error('save failed'));

      await expect(
        service.cancelSeatReservation(seat, 'flight-id'),
      ).rejects.toThrow('save failed');

      expect(emit).not.toHaveBeenCalled();
    });

    it('rejects a seat without a passenger before opening a transaction', async () => {
      await expect(
        service.cancelSeatReservation(
          { ...seat, passengerId: null },
          'flight-id',
        ),
      ).rejects.toThrow(BadRequestException);

      expect(transaction).not.toHaveBeenCalled();
    });
  });
});
