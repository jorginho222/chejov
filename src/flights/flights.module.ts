import { Module } from '@nestjs/common';
import { FlightsUpsertService } from './flights.upsert.service';
import { FlightsController } from './flights.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { FlightsSearchService } from './flights.search.service';
import { FlightsReserveService } from './flights.reserve.service';
import { Passenger } from '../passengers/entities/passenger.entity';
import { AirplanesModule } from '../airplanes/airplanes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Flight, Passenger]), AirplanesModule],
  controllers: [FlightsController],
  providers: [
    FlightsUpsertService,
    FlightsSearchService,
    FlightsReserveService,
  ],
})
export class FlightsModule {}
