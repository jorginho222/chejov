import { Module } from '@nestjs/common';
import { PassengersService } from './passengers.service';
import { PassengersController } from './passengers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Passenger } from './entities/passenger.entity';
import { SendMailToPassengerOnFlightReserved } from './subscribers/send.mail.to.passenger.on.flight.reserved';
import { Flight } from '../flights/entities/flight.entity';
import { Order } from '../orders/entities/order.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import mailerConfig from '../../mailer.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Passenger, Flight, Order]),
    MailerModule.forRoot(mailerConfig),
  ],
  controllers: [PassengersController],
  providers: [PassengersService, SendMailToPassengerOnFlightReserved],
})
export class PassengersModule {}
