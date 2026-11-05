import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airline } from './entities/airline.entity';
import { AirlinesController } from './airlines.controller';
import { AirlinesService } from './airlines.service';
import { AirlinesImportService } from './airlines.import.service';

@Module({
  imports: [TypeOrmModule.forFeature([Airline])],
  controllers: [AirlinesController],
  providers: [AirlinesService, AirlinesImportService],
})
export class AirlinesModule {}
