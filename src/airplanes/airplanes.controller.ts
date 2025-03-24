import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AirplanesService } from './airplanes.service';
import { CreateAirplaneDto } from './dto/create.airplane.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('airplanes')
export class AirplanesController {
  constructor(private readonly airplanesService: AirplanesService) {}

  @Post()
  @HttpCode(201)
  async upsert(@Body() airplaneDto: CreateAirplaneDto) {
    return await this.airplanesService.upsert(airplaneDto);
  }

  @Post('/:id/upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') airplaneId: string,
  ) {
    await this.airplanesService.uploadFile(file, airplaneId);
  }
}
