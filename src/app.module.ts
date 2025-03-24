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
import { S3Module } from './shared/s3/s3.module';
import mailerConfig from '../mailer.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    ConfigModule.forRoot({
      envFilePath: '.env.local',
    }),
    EventEmitterModule.forRoot(),
    MailerModule.forRoot(mailerConfig),
    FlightsModule,
    AirplanesModule,
    PassengersModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService, EventEmitter2],
})
export class AppModule {}
