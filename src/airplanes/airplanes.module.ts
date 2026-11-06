import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airplane } from './entities/airplane.entity';
import { Flight } from '../flights/entities/flight.entity';
import { AirplanesService } from './airplanes.service';
import { AirplanesImportService } from './airplanes.import.service';
import { AirplanesController } from './airplanes.controller';
import { S3Module } from '../shared/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Airplane, Flight]), S3Module],
  exports: [AirplanesService],
  controllers: [AirplanesController],
  providers: [AirplanesService, AirplanesImportService],
})
export class AirplanesModule {}
