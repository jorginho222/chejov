import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AirlinesService } from './airlines.service';
import { AirlineDto } from './dto/airline.dto';

@Controller('airlines')
export class AirlinesController {
  constructor(private readonly airlineService: AirlinesService) {}

  @Post()
  @HttpCode(201)
  async upsert(@Body() airlineDto: AirlineDto) {
    return await this.airlineService.create(airlineDto);
  }
}
