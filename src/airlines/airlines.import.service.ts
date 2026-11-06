import { randomUUID } from 'crypto';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { Airline } from './entities/airline.entity';
import { AirlineDto } from './dto/airline.dto';
import { FlightClasses } from '../flights/types/flight.classes';
import { isUniqueViolation } from '../shared/common/database.errors';
import {
  CellReader,
  ParsedRow,
  SpreadsheetImporter,
} from '../shared/import/spreadsheet.importer';
import { ImportRowError } from '../shared/import/import.row.error';

const LUGGAGE_COLUMNS = [
  'priceHandBaggage',
  'maxHandBaggage',
  'priceCheckedLuggage',
  'priceExceededWeight',
];
const CLASS_COLUMNS: FlightClasses[] = Object.values(FlightClasses);

@Injectable()
export class AirlinesImportService extends SpreadsheetImporter<AirlineDto> {
  protected readonly recordsName = 'airlines';
  protected readonly requiredColumns = [
    'name',
    'code',
    ...LUGGAGE_COLUMNS,
    ...CLASS_COLUMNS,
    'redeemFee',
  ];

  constructor(
    @InjectRepository(Airline)
    private readonly airlineRepository: Repository<Airline>,
  ) {
    super();
  }

  protected buildDto(cell: CellReader): AirlineDto {
    return plainToInstance(AirlineDto, {
      id: randomUUID(),
      name: cell('name'),
      code: cell('code'),
      luggageRules: {
        _priceHandBaggage: cell('priceHandBaggage'),
        _maxHandBaggage: cell('maxHandBaggage'),
        _priceCheckedLuggage: cell('priceCheckedLuggage'),
        _priceExceededWeight: cell('priceExceededWeight'),
      },
      flightClassPriceIncrements: CLASS_COLUMNS.map((flightClass) => ({
        class: flightClass,
        increment: { value: cell(flightClass) },
      })),
      redeemFee: cell('redeemFee'),
    });
  }

  protected toColumnName(path: string[]): string {
    const [property, child] = path;

    if (property === 'luggageRules' && child) {
      return child.replace(/^_/, '');
    }
    if (property === 'flightClassPriceIncrements' && child) {
      return CLASS_COLUMNS[Number(child)];
    }

    return property;
  }

  protected async findConflicts(
    rows: ParsedRow<AirlineDto>[],
  ): Promise<ImportRowError[]> {
    return [
      ...this.findValuesRepeatedInFile(rows, 'code', (dto) => dto.code),
      ...(await this.findCodesAlreadyStored(rows)),
    ];
  }

  // save() runs in a single transaction when given an array
  protected async save(dtos: AirlineDto[]): Promise<void> {
    try {
      await this.airlineRepository.save(this.airlineRepository.create(dtos));
    } catch (error) {
      // Another request may store one of these codes after the checks
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'An airline code in the file was stored by another request, so nothing was imported',
        );
      }
      throw error;
    }
  }

  private async findCodesAlreadyStored(
    rows: ParsedRow<AirlineDto>[],
  ): Promise<ImportRowError[]> {
    const codes = rows
      .map((row) => row.dto.code)
      .filter((code) => typeof code === 'string');

    if (codes.length === 0) {
      return [];
    }

    const stored = await this.airlineRepository.find({
      select: { code: true },
      where: { code: In(codes) },
    });
    const storedCodes = new Set(stored.map((airline) => airline.code));

    return rows
      .filter((row) => storedCodes.has(row.dto.code))
      .map((row) => ({
        row: row.rowNumber,
        column: 'code',
        messages: [`an airline with code ${row.dto.code} already exists`],
      }));
  }
}
