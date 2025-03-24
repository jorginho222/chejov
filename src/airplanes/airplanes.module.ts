import { Module } from '@nestjs/common';
import { AirplanesService } from './airplanes.service';
import { AirplanesController } from './airplanes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airplane } from './entities/airplane.entity';
import { S3Module } from '../shared/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Airplane]), S3Module],
  exports: [AirplanesService],
  controllers: [AirplanesController],
  providers: [AirplanesService],
})
export class AirplanesModule {}
