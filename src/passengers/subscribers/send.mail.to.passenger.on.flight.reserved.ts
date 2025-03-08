import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Passenger } from '../entities/passenger.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { Flight } from '../../flights/entities/flight.entity';
import { FlightReservedEvent } from '../../flights/events/flight.reserved.event';

export class SendMailToPassengerOnFlightReserved {
  constructor(
    private readonly passengerRepository: Repository<Passenger>,
    private readonly flightRepository: Repository<Flight>,
    private readonly mailService: MailerService,
  ) {}

  @OnEvent('flight.reserved')
  async handleEvent(event: FlightReservedEvent) {
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
      subject: `Seat ${event.seat.toString()} on Flight ${flight.code.toString()} reserved`,
    });
  }
}
