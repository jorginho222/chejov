# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

NestJS and TypeORM airline booking API with modules for flights, airplanes, passengers, orders, airlines and users.

## Commands

```bash
npm run build                                  # Compile to dist/
npm run lint                                   # ESLint, with auto-fix
npm run format                                 # Prettier
npm run start:dev                              # Start with hot reload
npm run start:debug                            # Start in debug mode with watch
npm run test                                   # All tests under src/
npm run test -- src/app.controller.spec.ts     # Single test file
npm run test -- --testNamePattern="test name"  # Tests matching a name
npm run test:watch                             # Watch mode
npm run test:cov                               # Coverage report
npm run test:e2e                               # Tests under test/ only (see Testing)
npm run test:debug                             # Debug tests with the Node inspector
```

## Conventions

- **File names:** dot-separated and lowercase (`flights.reserve.service.ts`, `create.flight.dto.ts`), with kebab-case module directories.
- **Module layout:** `dto/`, `entities/`, `valueObjects/`, `types/`, `events/` and `subscribers/` as needed, with specs next to the source they cover.
- **Import order:** external packages, then entities, then services, DTOs and value objects.
- **Errors:** use NestJS HTTP exceptions (`BadRequestException`, `NotFoundException`, etc.) for HTTP errors, and plain `Error` for domain validation in entities and value objects.
- **Entities:** use UUID primary keys, `readonly` for fields that must not change after creation, and validation methods on the entity class.
- **DTOs:** validate with class-validator and parse with class-transformer, using separate DTOs for create, update and response.
- **TypeScript:** only `strictNullChecks` is on, not full strict mode, and `noImplicitAny` is off. Avoid `any` anyway, and give public methods explicit return types.

## Local setup and database

- `docker compose up -d` starts the API (3000, hot reload), Postgres (host port 5433) and Adminer (8082). The host ports for Postgres and Adminer avoid clashes with other local projects. Inside Compose, Postgres is still `db:5432`, so tools running on the host need `DB_PORT=5433`. No containers restart on their own, so start them manually after a reboot.
- The `docker:*` npm scripts run from the host and act on the API container, which must be running: `npm run docker:install -- lodash`, `npm run docker:npm -- ci`, `npm run docker:exec -- node -v`, `npm run docker:shell`. Anything after `--` goes to the command in the container.
- `node_modules` lives in the `api_node_modules` named volume, not on the host, and a rebuild does not update it. After dependencies change, such as after a pull, run `npm run docker:npm -- ci`.
- Compose reads `POSTGRES_DB`, `POSTGRES_USER` and `POSTGRES_PASSWORD` from `.env` or the shell, defaulting to `chejov` / `postgres` / `postgres`. It sets the API's `DB_*` variables from them, with `DB_HOST=db` and `ENVIRONMENT=development`.
- The `Dockerfile` has `dev` and `prod` targets. Compose uses `dev`. Build the other with `docker build --target prod .`; it runs `node dist/src/main`.
- Compose mounts the whole project into the API, so files the container writes, including `dist/`, appear on the host. The image's `node` user is UID 1000, so a host user with a different UID may hit permission errors.
- App config comes from `.env` (gitignored; copy it from `.env.example`), with optional overrides in `.env.local`. `ormConfig.ts` loads both with dotenv, and `ConfigModule` loads them again for injected config such as `AWS_S3_*`. Variables set in Compose's `environment` block take priority over both files.
- `ENVIRONMENT=development` controls the database mode:
  - **Development:** TypeORM `synchronize: true`, no SSL, migrations are not run.
  - **Anything else, including unset:** no synchronize, SSL on, and `main.ts` runs pending migrations at boot.
- Swagger UI is served at `/docs`.

## Migrations

```bash
npm run build && npm run migration:run     # migrations load from dist/src/migration/*.js, so build first
npm run migration:generate -- src/migration/<Name>
npm run migration:revert
```

Because development relies on `synchronize`, a schema change works locally without a migration. Production needs one, so generate it in `src/migration/` whenever an entity changes. New entities must also be added to the `entities` array in `ormConfig.ts`, which lists them explicitly with no glob.

## Build output

`ormConfig.ts` and `mailer.config.ts` sit at the repo root and are imported from `src/`, so compiled code lands in `dist/src/` rather than `dist/`. `migrations` in `ormConfig.ts` depends on this layout.

## Testing

- Unit tests use the `@nestjs/testing` `Test` module, with repositories mocked through `getRepositoryToken`.
- `npm test` matches every `src/**/*.spec.ts`, which includes the `*.e2e.spec.ts` files co-located with their modules.
- `npm run test:e2e` only matches `test/*.e2e-spec.ts`, so it does not run those co-located specs.
- Co-located e2e specs use `ormConfigTest.ts` (in-memory SQLite). It registers only `Airplane`, `Flight` and `Passenger`, while `Flight` now has relations to `Airline` and `Order`, so specs that load `Flight` need those entities registered too.
- Some of these specs are stale. For example, `flights.e2e.spec.ts` builds its DTO with `flightPrices`, while the current flight model uses `basePrice`.

## Architecture

**Domain logic sits on entities; services orchestrate.** Services load entities, call methods on them, and save. Examples are `Flight.reserveSeat` / `setSeats` and `Order.calculateTotal`. Put business rules on the entity.

**Services are split by use case, not per module.** Flights has `FlightsUpsertService`, `FlightsSearchService` and `FlightsReserveService`. Orders follows the same pattern with `OrderUpsertService` and `OrderCancelService`.

**Value objects are stored as JSON columns:**

- `Flight.seats` is a JSON array of `AirplaneSeat`, generated from `Airplane.seatsConfig` by `Flight.setSeats()`. A reservation sets `passengerId` on a seat in that array and also adds to the `flight_passengers` relation, so the two must stay in sync.
- `Airline.luggageRules` and `flightClassPriceIncrements` use custom transformers in `src/airlines/transformers/` to rebuild class instances. Other JSON columns, such as `Flight.code` and `Order.luggage`, come back from the database as plain objects with no methods.

**Order pricing** (`Order.calculateTotal`) combines three parts into `grandTotal`:

- Flight price: `basePrice` plus the airline's percentage increment for the order's class, times `purchaseQuantity`.
- Luggage: charged per flight using the airline's `luggageRules`.
- Miles redemption: costs `distance × redeemQuantity` miles, plus the airline's `redeemFee`.

**Cross-module side effects use `@nestjs/event-emitter`.** Event classes live in the emitting module's `events/` directory, and handlers live in `subscribers/` (currently all under `passengers/`). A subscriber only runs if it is listed in its module's `providers`.

## Work in progress

These parts are incomplete, so check before assuming they work:

- `order.paid` has a subscriber class but nothing emits it, and `AddMilesToUserOnOrderPaid` is not registered in `PassengersModule`.
- `flight.cancelled` is emitted, but its mail subscriber is not registered in `PassengersModule` and its `@OnEvent` listens to `flight.reserved`.
- `OrderCancelService.cancel` and `OrderUpsertService.update` are TODO stubs. `order.suspend.service.ts` is a copy of the cancel service, and `SuspendedOrder` is not registered in `ormConfig.ts`.
- `FlightsReserveService` opens a `queryRunner` transaction but saves through the injected repositories and never commits, so those saves are not covered by the transaction.
- Many services throw plain `Error` for not-found cases, which surfaces as HTTP 500 rather than 404.

## Deployment

Pushing to `main` triggers `.github/workflows/main_chejov.yml`, which builds on Node 24 and deploys to the Azure Web App `chejov`. The workflow does not run tests or lint. Application Insights is enabled when `APPLICATION_INSIGHTS_CONNECTION_STRING` is set, and its setup must stay above the app bootstrap in `main.ts`.
