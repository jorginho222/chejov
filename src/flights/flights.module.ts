import { Module } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { AirplanesService } from '../airplanes/airplanes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Airplane } from '../airplanes/entities/airplane.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Flight, Airplane])],
  controllers: [FlightsController],
  providers: [FlightsService, AirplanesService],
})
export class FlightsModule {}
