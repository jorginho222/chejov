import { Body, Controller, Get, HttpCode, Post, Put } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Flight } from './entities/flight.entity';
import { CreateFlightDto } from './dto/create.flight.dto';
import { UpdateFlightDto } from './dto/update.flight.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  async findAll(): Promise<Flight[]> {
    return await this.flightsService.search({});
  }

  @Post()
  @HttpCode(201)
  async create(@Body() flightDto: CreateFlightDto) {
    return await this.flightsService.create(flightDto);
  }

  @Put()
  @HttpCode(200)
  async update(@Body() flightDto: UpdateFlightDto) {
    return await this.flightsService.update(flightDto);
  }
}
