import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightsModule } from './flights/flights.module';
import { AirplanesModule } from './airplanes/airplanes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassengersModule } from './passengers/passengers.module';
import ormConfig from '../ormConfig';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { MailerModule } from '@nestjs-modules/mailer';
import mailerConfig from '../mailer.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    EventEmitterModule.forRoot(),
    MailerModule.forRoot(mailerConfig),
    FlightsModule,
    AirplanesModule,
    PassengersModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventEmitter2],
})
export class AppModule {}
