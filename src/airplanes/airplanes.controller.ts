import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Airplane } from './entities/airplane.entity';
import { AirplanesService } from './airplanes.service';
import { AirplanesImportService } from './airplanes.import.service';
import { CreateAirplaneDto } from './dto/create.airplane.dto';
import { ImportResultDto } from '../shared/import/import.result.dto';
import { SpreadsheetUpload } from '../shared/import/spreadsheet.upload.decorator';

@Controller('airplanes')
export class AirplanesController {
  constructor(
    private readonly airplanesService: AirplanesService,
    private readonly airplanesImportService: AirplanesImportService,
  ) {}

  @Get()
  async findAll(): Promise<Airplane[]> {
    return await this.airplanesService.findAll();
  }

  @Post()
  @HttpCode(201)
  async upsert(@Body() airplaneDto: CreateAirplaneDto) {
    return await this.airplanesService.upsert(airplaneDto);
  }

  @Post('import')
  @SpreadsheetUpload()
  async importAirplanes(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ImportResultDto> {
    return await this.airplanesImportService.importFromFile(file);
  }

  @Put('/:id/upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') airplaneId: string,
  ) {
    await this.airplanesService.uploadFile(file, airplaneId);
  }

  @Put('/:id/delete-file')
  async deleteFile(@Param('id') airplaneId: string) {
    await this.airplanesService.deleteFile(airplaneId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'The airplane was deleted' })
  @ApiNotFoundResponse({ description: 'No airplane has this id' })
  @ApiConflictResponse({ description: 'Flights still use this airplane' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.airplanesService.remove(id);
  }
}
