import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { Airline } from './entities/airline.entity';
import { AirlinesModule } from './airlines.module';
import { FlightClassPriceIncrements } from '../flights/valueObjects/flight.class.price.increments';
import { FlightClasses } from '../flights/types/flight.classes';
import { LuggageRules } from './valueObjects/luggageRules';
import { Percentage } from '../shared/common/percentage';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const buildAirline = (id: string, name: string, code: string): Airline => {
  const increment = new FlightClassPriceIncrements();
  increment.class = FlightClasses.Economy;
  increment.increment = new Percentage(10);

  const airline = new Airline();
  airline.id = id;
  airline.name = name;
  airline.code = code;
  airline.luggageRules = new LuggageRules(25, 2, 60, 15.5);
  airline.flightClassPriceIncrements = [increment];
  airline.redeemFee = 35;
  return airline;
};

describe('Airlines endpoints', () => {
  let app: INestApplication<App>;
  let repository: Repository<Airline>;

  const zulu = buildAirline(
    '11111111-1111-4111-8111-111111111111',
    'Zulu Air',
    'ZU',
  );
  const alpha = buildAirline(
    '22222222-2222-4222-8222-222222222222',
    'Alpha Air',
    'AL',
  );

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
    // Same as main.ts, so the DTO's transforms and validations run
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    repository = module.get(getRepositoryToken(Airline));
  });

  beforeEach(async () => {
    await repository.clear();
    await repository.save([zulu, alpha]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /airlines lists airlines ordered by name', async () => {
    const response = await request(app.getHttpServer())
      .get('/airlines')
      .expect(200);

    const airlines = response.body as Airline[];
    expect(airlines.map((airline) => airline.name)).toEqual([
      'Alpha Air',
      'Zulu Air',
    ]);
  });

  it('GET /airlines/:id returns the airline in the wire format the frontend reads', async () => {
    const response = await request(app.getHttpServer())
      .get(`/airlines/${alpha.id}`)
      .expect(200);

    expect(response.body).toEqual({
      id: alpha.id,
      name: 'Alpha Air',
      code: 'AL',
      luggageRules: {
        _priceHandBaggage: 25,
        _maxHandBaggage: 2,
        _priceCheckedLuggage: 60,
        _priceExceededWeight: 15.5,
      },
      flightClassPriceIncrements: [
        { class: 'economy', increment: { value: 10 } },
      ],
      redeemFee: 35,
    });
  });

  it('GET /airlines/:id returns 404 for an unknown id', async () => {
    await request(app.getHttpServer())
      .get(`/airlines/${UNKNOWN_ID}`)
      .expect(404);
  });

  it('GET /airlines/:id returns 400 for an id that is not a UUID', async () => {
    await request(app.getHttpServer()).get('/airlines/not-a-uuid').expect(400);
  });

  it('DELETE /airlines/:id deletes the airline and returns 204', async () => {
    await request(app.getHttpServer())
      .delete(`/airlines/${alpha.id}`)
      .expect(204);

    expect(await repository.findOneBy({ id: alpha.id })).toBeNull();
    expect(await repository.count()).toBe(1);
  });

  it('DELETE /airlines/:id returns 404 for an unknown id', async () => {
    await request(app.getHttpServer())
      .delete(`/airlines/${UNKNOWN_ID}`)
      .expect(404);

    expect(await repository.count()).toBe(2);
  });

  it('DELETE /airlines/:id returns 400 for an id that is not a UUID', async () => {
    await request(app.getHttpServer())
      .delete('/airlines/not-a-uuid')
      .expect(400);
  });

  describe('airline code', () => {
    const NEW_ID = '33333333-3333-4333-8333-333333333333';

    const body = (id: string, code: unknown, name = 'Beta Air'): object => ({
      id,
      name,
      code,
      luggageRules: {
        _priceHandBaggage: 25,
        _maxHandBaggage: 2,
        _priceCheckedLuggage: 60,
        _priceExceededWeight: 15.5,
      },
      flightClassPriceIncrements: [
        { class: 'economy', increment: { value: 10 } },
      ],
      redeemFee: 35,
    });

    const post = (payload: object): request.Test =>
      request(app.getHttpServer()).post('/airlines').send(payload);

    it('stores the code trimmed and uppercase', async () => {
      await post(body(NEW_ID, ' b2 ')).expect(201);

      const stored = await repository.findOneBy({ id: NEW_ID });
      expect(stored?.code).toBe('B2');
    });

    it('lets an upsert keep the airline its own code', async () => {
      await post(body(alpha.id, 'al', 'Alpha Renamed')).expect(201);

      const stored = await repository.findOneBy({ id: alpha.id });
      expect(stored).toMatchObject({ name: 'Alpha Renamed', code: 'AL' });
      expect(await repository.count()).toBe(2);
    });

    it('returns 409 for a new airline with a code already in use, whatever its case', async () => {
      const response = await post(body(NEW_ID, 'zu')).expect(409);

      expect(response.body).toMatchObject({
        message: 'An airline with code ZU already exists',
      });
      expect(await repository.count()).toBe(2);
    });

    it('returns 409 when an upsert changes the code to one already in use', async () => {
      await post(body(alpha.id, 'ZU')).expect(409);

      const stored = await repository.findOneBy({ id: alpha.id });
      expect(stored?.code).toBe('AL');
    });

    it.each([
      ['too long', 'ABC'],
      ['too short', 'A'],
      ['a symbol', 'A-'],
      ['blank', '  '],
      ['not a string', 12],
    ])('returns 400 for a code that is %s', async (_case, code) => {
      const response = await post(body(NEW_ID, code)).expect(400);

      const { message } = response.body as { message: string[] };
      expect(message).toContain(
        'code must be 2 letters or digits, such as LA or U2',
      );
    });

    it('has a unique constraint in the database too', async () => {
      await expect(
        repository.save(buildAirline(NEW_ID, 'Copy Air', 'ZU')),
      ).rejects.toThrow(/UNIQUE constraint failed: airline.code/);
    });
  });
});
