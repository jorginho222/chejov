import { randomUUID } from 'crypto';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { Airplane } from './entities/airplane.entity';
import { CreateAirplaneDto } from './dto/create.airplane.dto';
import { FlightClasses } from '../flights/types/flight.classes';
import { isUniqueViolation } from '../shared/common/database.errors';
import {
  CellReader,
  ParsedRow,
  SpreadsheetImporter,
} from '../shared/import/spreadsheet.importer';
import { ImportRowError } from '../shared/import/import.row.error';

const CLASSES: FlightClasses[] = Object.values(FlightClasses);

const rowsColumn = (flightClass: FlightClasses): string => `${flightClass}Rows`;
const columnsColumn = (flightClass: FlightClasses): string =>
  `${flightClass}Columns`;

const SEAT_COLUMN_BY_PROPERTY: Record<
  string,
  (flightClass: FlightClasses) => string
> = {
  rowsQuantity: rowsColumn,
  columnsQuantity: columnsColumn,
};

// One airplane per row. Each class has a pair of columns, such as economyRows
// and economyColumns; leave both blank when the airplane lacks that class.
@Injectable()
export class AirplanesImportService extends SpreadsheetImporter<CreateAirplaneDto> {
  protected readonly recordsName = 'airplanes';
  protected readonly requiredColumns = [
    'brand',
    'model',
    'passengersCapacity',
    ...CLASSES.flatMap((flightClass) => [
      rowsColumn(flightClass),
      columnsColumn(flightClass),
    ]),
  ];

  constructor(
    @InjectRepository(Airplane)
    private readonly airplaneRepository: Repository<Airplane>,
  ) {
    super();
  }

  protected buildDto(cell: CellReader): CreateAirplaneDto {
    const seatsConfig = CLASSES.map((flightClass) => ({
      class: flightClass,
      rowsQuantity: cell(rowsColumn(flightClass)),
      columnsQuantity: cell(columnsColumn(flightClass)),
    })).filter(
      (config) =>
        config.rowsQuantity !== undefined ||
        config.columnsQuantity !== undefined,
    );

    return plainToInstance(CreateAirplaneDto, {
      id: randomUUID(),
      brand: cell('brand'),
      model: cell('model'),
      passengersCapacity: cell('passengersCapacity'),
      seatsConfig,
    });
  }

  protected toColumnName(path: string[], dto: CreateAirplaneDto): string {
    const [property, index, child] = path;

    if (property === 'seatsConfig' && child) {
      const flightClass = dto.seatsConfig[Number(index)].class;
      return SEAT_COLUMN_BY_PROPERTY[child]?.(flightClass) ?? property;
    }

    return property;
  }

  protected async findConflicts(
    rows: ParsedRow<CreateAirplaneDto>[],
  ): Promise<ImportRowError[]> {
    return [
      ...this.findValuesRepeatedInFile(rows, 'model', (dto) => dto.model),
      ...(await this.findModelsAlreadyStored(rows)),
    ];
  }

  // save() runs in a single transaction when given an array
  protected async save(dtos: CreateAirplaneDto[]): Promise<void> {
    const airplanes = this.airplaneRepository.create(dtos);
    airplanes.forEach((airplane) => airplane.validate());

    try {
      await this.airplaneRepository.save(airplanes);
    } catch (error) {
      // Another request may store one of these models after the checks
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'An airplane model in the file was stored by another request, so nothing was imported',
        );
      }
      throw error;
    }
  }

  private async findModelsAlreadyStored(
    rows: ParsedRow<CreateAirplaneDto>[],
  ): Promise<ImportRowError[]> {
    const models = rows
      .map((row) => row.dto.model)
      .filter((model) => typeof model === 'string');

    if (models.length === 0) {
      return [];
    }

    const stored = await this.airplaneRepository.find({
      select: { model: true },
      where: { model: In(models) },
    });
    const storedModels = new Set(stored.map((airplane) => airplane.model));

    return rows
      .filter((row) => storedModels.has(row.dto.model))
      .map((row) => ({
        row: row.rowNumber,
        column: 'model',
        messages: [`an airplane with model ${row.dto.model} already exists`],
      }));
  }
}
