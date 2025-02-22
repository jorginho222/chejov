import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PassengersService } from './passengers.service';
import { PassengerDto } from './dto/passenger.dto';

@Controller('passengers')
export class PassengersController {
  constructor(private readonly passengersService: PassengersService) {}

  @Post()
  @HttpCode(201)
  async upsert(@Body() passengerDto: PassengerDto) {
    return await this.passengersService.upsert(passengerDto);
  }
}
