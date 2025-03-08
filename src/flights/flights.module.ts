import { Module } from '@nestjs/common';
import { FlightsUpsertService } from './flights.upsert.service';
import { FlightsController } from './flights.controller';
import { AirplanesService } from '../airplanes/airplanes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Airplane } from '../airplanes/entities/airplane.entity';
import { FlightsSearchService } from './flights.search.service';
import { FlightsReserveService } from './flights.reserve.service';
import { Passenger } from '../passengers/entities/passenger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Flight, Airplane, Passenger])],
  controllers: [FlightsController],
  providers: [
    FlightsUpsertService,
    FlightsSearchService,
    FlightsReserveService,
    AirplanesService,
  ],
})
export class FlightsModule {}
