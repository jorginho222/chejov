import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { FlightsUpsertService } from './flights.upsert.service';
import { Flight } from './entities/flight.entity';
import { CreateFlightDto } from './dto/create.flight.dto';
import { UpdateFlightScheduleDto } from './dto/update.flight.schedule.dto';
import { FlightsSearchService } from './flights.search.service';
import { UpdateFlightStatusDto } from './dto/update.flight.status.dto';
import { AirplaneSeat } from './valueObjects/airplane.seat';
import { FlightsReserveService } from './flights.reserve.service';

@Controller('flights')
export class FlightsController {
  constructor(
    private readonly flightsUpsertService: FlightsUpsertService,
    private readonly flightsSearchService: FlightsSearchService,
    private readonly flightsReserveService: FlightsReserveService,
  ) {}

  @Get()
  async findAll(): Promise<Flight[]> {
    return await this.flightsSearchService.search({});
  }

  @Post()
  @HttpCode(201)
  async create(@Body() flightDto: CreateFlightDto) {
    return await this.flightsUpsertService.create(flightDto);
  }

  @Put('/:flightId/reserve')
  @HttpCode(200)
  async reserveFlightSeat(
    @Body() seat: AirplaneSeat,
    @Param('flightId') flightId: string,
  ) {
    return await this.flightsReserveService.reserveSeat(seat, flightId);
  }

  @Patch('/schedule')
  @HttpCode(200)
  async updateSchedule(@Body() flightDto: UpdateFlightScheduleDto) {
    return await this.flightsUpsertService.updateSchedule(flightDto);
  }

  @Patch('/status')
  @HttpCode(200)
  async updateStatus(@Body() flightDto: UpdateFlightStatusDto) {
    return await this.flightsUpsertService.updateStatus(flightDto);
  }
}
