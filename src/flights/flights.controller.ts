import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { FlightsUpsertService } from './flights.upsert.service';
import { Flight } from './entities/flight.entity';
import { CreateFlightDto } from './dto/create.flight.dto';
import { UpdateFlightScheduleDto } from './dto/update.flight.schedule.dto';
import { FlightsSearchService } from './flights.search.service';
import { UpdateFlightStatusDto } from './dto/update.flight.status.dto';
import { AirplaneSeat } from './valueObjects/airplane.seat';
import { FlightsReserveService } from './flights.reserve.service';
import { Request } from 'express';
import { FindManyOptions } from 'typeorm';

@Controller('flights')
export class FlightsController {
  constructor(
    private readonly flightsUpsertService: FlightsUpsertService,
    private readonly flightsSearchService: FlightsSearchService,
    private readonly flightsReserveService: FlightsReserveService,
  ) {}

  @Get()
  async searchByCriteria(@Req() request: Request): Promise<Flight[]> {
    const criteria = JSON.parse(
      request.query.criteria as string,
    ) as FindManyOptions<Flight>;

    return await this.flightsSearchService.search(criteria);
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

  @Put('/:flightId/cancel')
  @HttpCode(200)
  async cancelFlightSeat(
    @Body() seat: AirplaneSeat,
    @Param('flightId') flightId: string,
  ) {
    return await this.flightsReserveService.cancelSeatReservation(
      seat,
      flightId,
    );
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
