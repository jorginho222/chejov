import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightsModule } from './flights/flights.module';
import { AirplanesModule } from './airplanes/airplanes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassengersModule } from './passengers/passengers.module';
import ormConfig from '../ormConfig';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    EventEmitterModule.forRoot(),
    FlightsModule,
    AirplanesModule,
    PassengersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
