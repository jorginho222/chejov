import { Repository } from 'typeorm';
import { Passenger } from '../entities/passenger.entity';
import { Flight } from '../../flights/entities/flight.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { FlightCancelledEvent } from '../../flights/events/flight.cancelled.event';

export class SendMailToPassengerOnFlightCancelled {
  constructor(
    @InjectRepository(Passenger)
    private readonly passengerRepository: Repository<Passenger>,
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    private readonly mailService: MailerService,
  ) {}

  @OnEvent('flight.reserved')
  async handleEvent(event: FlightCancelledEvent) {
    const passengerSearch = await this.passengerRepository.find({
      where: { id: event.seat.passengerId ?? '' },
    });
    const flightSearch = await this.flightRepository.find({
      where: { id: event.flightId },
    });
    const passenger = passengerSearch[0];
    const flight = flightSearch[0];

    await this.mailService.sendMail({
      from: 'Flights API <flights.api@example.com>',
      to: passenger.email,
      subject: `Seat ${event.seat.toString()} on Flight ${flight.code.toString()} Cancelled`,
    });
  }
}
