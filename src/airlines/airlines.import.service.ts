import { randomUUID } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { CellValue, Row, Workbook, Worksheet } from 'exceljs';
import { In, Repository } from 'typeorm';
import { Airline } from './entities/airline.entity';
import { AirlineDto } from './dto/airline.dto';
import { ImportAirlinesResultDto } from './dto/import.airlines.result.dto';
import { FlightClasses } from '../flights/types/flight.classes';
import { AirlineImportRowError } from './types/airline.import.row.error';

const LUGGAGE_COLUMNS = [
  'priceHandBaggage',
  'maxHandBaggage',
  'priceCheckedLuggage',
  'priceExceededWeight',
];
const CLASS_COLUMNS: FlightClasses[] = Object.values(FlightClasses);
const REQUIRED_COLUMNS = [
  'name',
  'code',
  ...LUGGAGE_COLUMNS,
  ...CLASS_COLUMNS,
  'redeemFee',
];

interface ParsedRow {
  rowNumber: number;
  airline: AirlineDto;
}

@Injectable()
export class AirlinesImportService {
  constructor(
    @InjectRepository(Airline)
    private readonly airlineRepository: Repository<Airline>,
  ) {}

  // All or nothing: a single invalid row rejects the whole file
  async importFromFile(
    file?: Express.Multer.File,
  ): Promise<ImportAirlinesResultDto> {
    const worksheet = await this.readWorksheet(file);
    const columns = this.readColumns(worksheet);
    const rows = this.parseRows(worksheet, columns);

    if (rows.length === 0) {
      throw new BadRequestException('The file has no airlines to import');
    }

    const errors = [
      ...(await this.validateRows(rows)),
      ...this.findCodesRepeatedInFile(rows),
      ...(await this.findCodesAlreadyStored(rows)),
    ].sort((a, b) => a.row - b.row);

    if (errors.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'The file has invalid rows, so nothing was imported',
        errors,
      });
    }

    // save() runs in a single transaction when given an array
    await this.airlineRepository.save(
      this.airlineRepository.create(rows.map((row) => row.airline)),
    );

    return { imported: rows.length };
  }

  private async readWorksheet(file?: Express.Multer.File): Promise<Worksheet> {
    if (!file) {
      throw new BadRequestException('A file is required in the "file" field');
    }

    const workbook = new Workbook();
    try {
      await workbook.xlsx.load(file.buffer);
    } catch {
      throw new BadRequestException('The file must be a valid .xlsx workbook');
    }

    const [worksheet] = workbook.worksheets;
    if (!worksheet) {
      throw new BadRequestException('The workbook has no worksheets');
    }

    return worksheet;
  }

  private readColumns(worksheet: Worksheet): Map<string, number> {
    const columns = new Map<string, number>();
    worksheet.getRow(1).eachCell((cell, columnNumber) => {
      const header = this.readCell(cell.value);
      if (typeof header === 'string') {
        columns.set(header, columnNumber);
      }
    });

    const missing = REQUIRED_COLUMNS.filter((column) => !columns.has(column));
    if (missing.length > 0) {
      throw new BadRequestException(
        `The file is missing these columns: ${missing.join(', ')}`,
      );
    }

    return columns;
  }

  private parseRows(
    worksheet: Worksheet,
    columns: Map<string, number>,
  ): ParsedRow[] {
    const rows: ParsedRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        rows.push({ rowNumber, airline: this.buildDto(row, columns) });
      }
    });

    return rows;
  }

  private buildDto(row: Row, columns: Map<string, number>): AirlineDto {
    const cell = (column: string): unknown =>
      this.readCell(row.getCell(columns.get(column) as number).value);

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

  // Formulas, rich text and hyperlinks are objects in exceljs
  private readCell(value: CellValue): unknown {
    let content: unknown = value;

    if (value !== null && typeof value === 'object') {
      if ('result' in value) {
        content = value.result;
      } else if ('richText' in value) {
        content = value.richText.map((part) => part.text).join('');
      } else if ('text' in value) {
        content = value.text;
      }
    }

    if (typeof content === 'string') {
      return content.trim();
    }

    return content ?? undefined;
  }

  private async validateRows(
    rows: ParsedRow[],
  ): Promise<AirlineImportRowError[]> {
    const errors = await Promise.all(
      rows.map(async ({ rowNumber, airline }) =>
        this.flattenErrors(await validate(airline)).map((error) => ({
          row: rowNumber,
          ...error,
        })),
      ),
    );

    return errors.flat();
  }

  private flattenErrors(
    errors: ValidationError[],
    parentPath: string[] = [],
  ): Omit<AirlineImportRowError, 'row'>[] {
    return errors.flatMap((error) => {
      const path = [...parentPath, error.property];
      const own = error.constraints
        ? [
            {
              column: this.toColumnName(path),
              messages: Object.values(error.constraints),
            },
          ]
        : [];

      return [...own, ...this.flattenErrors(error.children ?? [], path)];
    });
  }

  // Maps a path in the DTO back to the spreadsheet column it came from
  private toColumnName(path: string[]): string {
    const [property, child] = path;

    if (property === 'luggageRules' && child) {
      return child.replace(/^_/, '');
    }
    if (property === 'flightClassPriceIncrements' && child) {
      return CLASS_COLUMNS[Number(child)];
    }

    return property;
  }

  private findCodesRepeatedInFile(rows: ParsedRow[]): AirlineImportRowError[] {
    const firstRowByCode = new Map<string, number>();
    const errors: AirlineImportRowError[] = [];

    for (const { rowNumber, airline } of rows) {
      const { code } = airline;
      if (typeof code !== 'string') {
        continue;
      }

      const firstRow = firstRowByCode.get(code);
      if (firstRow === undefined) {
        firstRowByCode.set(code, rowNumber);
      } else {
        errors.push({
          row: rowNumber,
          column: 'code',
          messages: [`code ${code} is already used in row ${firstRow}`],
        });
      }
    }

    return errors;
  }

  private async findCodesAlreadyStored(
    rows: ParsedRow[],
  ): Promise<AirlineImportRowError[]> {
    const codes = rows
      .map((row) => row.airline.code)
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
      .filter((row) => storedCodes.has(row.airline.code))
      .map((row) => ({
        row: row.rowNumber,
        column: 'code',
        messages: [`an airline with code ${row.airline.code} already exists`],
      }));
  }
}
