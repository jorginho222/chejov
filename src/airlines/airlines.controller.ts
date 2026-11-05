import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Airline } from './entities/airline.entity';
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

  @Get()
  async findAll(): Promise<Airline[]> {
    return await this.airlineService.findAll();
  }

  @Get(':id')
  @ApiNotFoundResponse({ description: 'No airline has this id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Airline> {
    return await this.airlineService.findOne(id);
  }

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

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'The airline was deleted' })
  @ApiNotFoundResponse({ description: 'No airline has this id' })
  @ApiConflictResponse({ description: 'Flights still use this airline' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.airlineService.remove(id);
  }
}
