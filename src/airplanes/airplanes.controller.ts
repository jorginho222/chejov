import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AirplanesService } from './airplanes.service';
import { CreateAirplaneDto } from './dto/create.airplane.dto';

@Controller('airplanes')
export class AirplanesController {
  constructor(private readonly airplanesService: AirplanesService) {}

  @Post()
  @HttpCode(201)
  async upsert(@Body() airplaneDto: CreateAirplaneDto) {
    return await this.airplanesService.upsert(airplaneDto);
  }
}
