import { BadRequestException } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { CellValue, Row, Workbook, Worksheet } from 'exceljs';
import { ImportResultDto } from './import.result.dto';
import { ImportRowError } from './import.row.error';

export interface ParsedRow<TDto> {
  rowNumber: number;
  dto: TDto;
}

export type CellReader = (column: string) => unknown;

// Reads the first worksheet of an .xlsx file, one record per row after the
// header row, and finds each column by its header, whatever its position.
// All or nothing: a single invalid row rejects the whole file.
export abstract class SpreadsheetImporter<TDto extends object> {
  // Plural name of the records, used in messages, such as "airlines"
  protected abstract readonly recordsName: string;

  protected abstract readonly requiredColumns: string[];

  protected abstract buildDto(cell: CellReader): TDto;

  protected abstract save(dtos: TDto[]): Promise<void>;

  // Maps a path in the DTO, such as ['luggageRules', '_maxHandBaggage'],
  // back to the spreadsheet column it came from
  protected abstract toColumnName(path: string[], dto: TDto): string;

  // Checks beyond the DTO's own validation, such as duplicated codes
  protected abstract findConflicts(
    rows: ParsedRow<TDto>[],
  ): Promise<ImportRowError[]>;

  async importFromFile(file?: Express.Multer.File): Promise<ImportResultDto> {
    const worksheet = await this.readWorksheet(file);
    const columns = this.readColumns(worksheet);
    const rows = this.parseRows(worksheet, columns);

    if (rows.length === 0) {
      throw new BadRequestException(
        `The file has no ${this.recordsName} to import`,
      );
    }

    const errors = [
      ...(await this.validateRows(rows)),
      ...(await this.findConflicts(rows)),
    ].sort((a, b) => a.row - b.row);

    if (errors.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'The file has invalid rows, so nothing was imported',
        errors,
      });
    }

    await this.save(rows.map((row) => row.dto));

    return { imported: rows.length };
  }

  // Reports every row after the first that repeats a value
  protected findValuesRepeatedInFile(
    rows: ParsedRow<TDto>[],
    column: string,
    valueOf: (dto: TDto) => unknown,
  ): ImportRowError[] {
    const firstRowByValue = new Map<string, number>();
    const errors: ImportRowError[] = [];

    for (const { rowNumber, dto } of rows) {
      const value = valueOf(dto);
      if (typeof value !== 'string') {
        continue;
      }

      const firstRow = firstRowByValue.get(value);
      if (firstRow === undefined) {
        firstRowByValue.set(value, rowNumber);
      } else {
        errors.push({
          row: rowNumber,
          column,
          messages: [`${column} ${value} is already used in row ${firstRow}`],
        });
      }
    }

    return errors;
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

    const missing = this.requiredColumns.filter(
      (column) => !columns.has(column),
    );
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
  ): ParsedRow<TDto>[] {
    const rows: ParsedRow<TDto>[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        rows.push({
          rowNumber,
          dto: this.buildDto(this.cellReader(row, columns)),
        });
      }
    });

    return rows;
  }

  private cellReader(row: Row, columns: Map<string, number>): CellReader {
    return (column: string): unknown => {
      const columnNumber = columns.get(column);
      return columnNumber === undefined
        ? undefined
        : this.readCell(row.getCell(columnNumber).value);
    };
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
      const trimmed = content.trim();
      // A blank cell counts as empty, so optional columns can be left blank
      return trimmed === '' ? undefined : trimmed;
    }

    return content ?? undefined;
  }

  private async validateRows(
    rows: ParsedRow<TDto>[],
  ): Promise<ImportRowError[]> {
    const errors = await Promise.all(
      rows.map(async ({ rowNumber, dto }) =>
        this.flattenErrors(await validate(dto), dto).map((error) => ({
          row: rowNumber,
          ...error,
        })),
      ),
    );

    return errors.flat();
  }

  private flattenErrors(
    errors: ValidationError[],
    dto: TDto,
    parentPath: string[] = [],
  ): Omit<ImportRowError, 'row'>[] {
    return errors.flatMap((error) => {
      const path = [...parentPath, error.property];
      const own = error.constraints
        ? [
            {
              column: this.toColumnName(path, dto),
              messages: Object.values(error.constraints),
            },
          ]
        : [];

      return [...own, ...this.flattenErrors(error.children ?? [], dto, path)];
    });
  }
}
