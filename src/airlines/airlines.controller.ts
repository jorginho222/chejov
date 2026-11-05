import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AirlinesService } from './airlines.service';
import { AirlinesImportService } from './airlines.import.service';
import { AirlineDto } from './dto/airline.dto';
import { ImportAirlinesResultDto } from './dto/import.airlines.result.dto';

const MAX_IMPORT_FILE_BYTES = 1024 * 1024;

@Controller('airlines')
export class AirlinesController {
  constructor(
    private readonly airlineService: AirlinesService,
    private readonly airlinesImportService: AirlinesImportService,
  ) {}

  @Post()
  @HttpCode(201)
  async upsert(@Body() airlineDto: AirlineDto) {
    return await this.airlineService.create(airlineDto);
  }

  @Post('import')
  @HttpCode(201)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_IMPORT_FILE_BYTES } }),
  )
  async importAirlines(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ImportAirlinesResultDto> {
    return await this.airlinesImportService.importFromFile(file);
  }
}
