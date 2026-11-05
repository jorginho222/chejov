import { resolve } from 'path';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Workbook } from 'exceljs';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { Airline } from './entities/airline.entity';
import { AirlinesModule } from './airlines.module';
import { LuggageRules } from './valueObjects/luggageRules';

const SAMPLE_FILE = resolve(__dirname, '../../data/airlines.import.xlsx');

const HEADERS = [
  'name',
  'code',
  'priceHandBaggage',
  'maxHandBaggage',
  'priceCheckedLuggage',
  'priceExceededWeight',
  'economy',
  'premiumEconomy',
  'business',
  'first',
  'redeemFee',
];

const validRow = (name: string, code: string): unknown[] => [
  name,
  code,
  25,
  2,
  60,
  15.5,
  0,
  15,
  40,
  80,
  35,
];

const buildFile = async (
  rows: unknown[][],
  headers: string[] = HEADERS,
): Promise<Buffer> => {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('airlines');
  sheet.addRow(headers);
  sheet.addRows(rows);

  return Buffer.from(await workbook.xlsx.writeBuffer());
};

describe('POST /airlines/import', () => {
  let app: INestApplication<App>;
  let repository: Repository<Airline>;

  const upload = (file: Buffer | string): request.Test =>
    request(app.getHttpServer())
      .post('/airlines/import')
      .attach('file', file, 'airlines.xlsx');

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Airline],
          synchronize: true,
        }),
        AirlinesModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    repository = module.get(getRepositoryToken(Airline));
  });

  beforeEach(async () => {
    await repository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('imports the sample file', async () => {
    const response = await upload(SAMPLE_FILE).expect(201);

    expect(response.body).toEqual({ imported: 20 });
    expect(await repository.count()).toBe(20);
  });

  it('stores each column in the right place, with a generated id', async () => {
    await upload(await buildFile([validRow('Nimbus Air', 'NX')])).expect(201);

    const [airline] = await repository.find();

    expect(airline.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(airline.name).toBe('Nimbus Air');
    expect(airline.code).toBe('NX');
    expect(airline.redeemFee).toBe(35);
    expect(airline.luggageRules).toBeInstanceOf(LuggageRules);
    expect(airline.luggageRules.priceHandBaggage).toBe(25);
    expect(airline.luggageRules.maxHandBaggage).toBe(2);
    expect(airline.luggageRules.priceCheckedLuggage).toBe(60);
    expect(airline.luggageRules.priceExceededWeight).toBe(15.5);
    expect(
      airline.flightClassPriceIncrements.map((item) => [
        item.class,
        item.increment.value,
      ]),
    ).toEqual([
      ['economy', 0],
      ['premiumEconomy', 15],
      ['business', 40],
      ['first', 80],
    ]);
  });

  it('finds columns by header, whatever their order', async () => {
    const reversed = [...HEADERS].reverse();
    const row = [...validRow('Nimbus Air', 'NX')].reverse();

    await upload(await buildFile([row], reversed)).expect(201);

    const [airline] = await repository.find();
    expect(airline.code).toBe('NX');
    expect(airline.redeemFee).toBe(35);
  });

  it('reads the value of a formula cell', async () => {
    const row = validRow('Nimbus Air', 'NX');
    row[2] = { formula: '20+5', result: 25 };

    await upload(await buildFile([row])).expect(201);

    const [airline] = await repository.find();
    expect(airline.luggageRules.priceHandBaggage).toBe(25);
  });

  it('reports every invalid cell by row and column and saves nothing', async () => {
    const badCode = validRow('Nimbus Air', 'NXX');
    const badLuggage = validRow('Zephyr Wings', 'ZW');
    badLuggage[3] = 1.5;
    const badIncrement = validRow('Orion Skylines', 'OZ');
    badIncrement[8] = -5;
    const missingName = validRow('', 'BZ');
    missingName[0] = null;

    const response = await upload(
      await buildFile([
        validRow('Fénix Dorado', 'FQ'),
        badCode,
        badLuggage,
        badIncrement,
        missingName,
      ]),
    ).expect(400);

    const body = response.body as {
      errors: { row: number; column: string }[];
    };
    expect(body.errors.map(({ row, column }) => [row, column])).toEqual([
      [3, 'code'],
      [4, 'maxHandBaggage'],
      [5, 'business'],
      [6, 'name'],
    ]);
    expect(await repository.count()).toBe(0);
  });

  it('rejects a code repeated in the file', async () => {
    const response = await upload(
      await buildFile([validRow('One', 'AA'), validRow('Two', 'AA')]),
    ).expect(400);

    const body = response.body as { errors: unknown[] };
    expect(body.errors).toEqual([
      {
        row: 3,
        column: 'code',
        messages: ['code AA is already used in row 2'],
      },
    ]);
    expect(await repository.count()).toBe(0);
  });

  it('rejects a code that is already stored, so re-importing adds nothing', async () => {
    const file = await buildFile([validRow('Nimbus Air', 'NX')]);
    await upload(file).expect(201);

    const response = await upload(file).expect(400);

    const body = response.body as { errors: unknown[] };
    expect(body.errors).toEqual([
      {
        row: 2,
        column: 'code',
        messages: ['an airline with code NX already exists'],
      },
    ]);
    expect(await repository.count()).toBe(1);
  });

  it('stores codes uppercase and treats them as duplicates whatever their case', async () => {
    await upload(await buildFile([validRow('Nimbus Air', 'nx')])).expect(201);
    expect((await repository.findOneBy({ name: 'Nimbus Air' }))?.code).toBe(
      'NX',
    );

    const response = await upload(
      await buildFile([validRow('Other', 'Nx'), validRow('Again', 'nX')]),
    ).expect(400);

    const body = response.body as { errors: unknown[] };
    expect(body.errors).toEqual([
      {
        row: 2,
        column: 'code',
        messages: ['an airline with code NX already exists'],
      },
      {
        row: 3,
        column: 'code',
        messages: ['code NX is already used in row 2'],
      },
      {
        row: 3,
        column: 'code',
        messages: ['an airline with code NX already exists'],
      },
    ]);
    expect(await repository.count()).toBe(1);
  });

  it('rejects a file with missing columns', async () => {
    const headers = HEADERS.filter((header) => header !== 'first');

    const response = await upload(await buildFile([], headers)).expect(400);

    expect((response.body as { message: string }).message).toBe(
      'The file is missing these columns: first',
    );
  });

  it('rejects a file with no airlines', async () => {
    await upload(await buildFile([])).expect(400);
  });

  it('rejects a file that is not a workbook', async () => {
    await upload(Buffer.from('not a spreadsheet')).expect(400);
  });

  it('rejects a request with no file', async () => {
    await request(app.getHttpServer()).post('/airlines/import').expect(400);
  });

  it('rejects a file over the size limit', async () => {
    await upload(Buffer.alloc(1024 * 1024 + 1)).expect(413);
  });
});
