# AGENTS.md - Chejov Project Guidelines

## Project Overview

This is a NestJS TypeScript project implementing an airline booking system with modules for flights, airplanes, passengers, orders, airlines, and users.

## Build, Lint, and Test Commands

### Build

```bash
npm run build          # Build the NestJS application to dist/
```

### Lint and Format

```bash
npm run lint           # Lint with ESLint and auto-fix
npm run format         # Format code with Prettier
```

### Testing

```bash
npm run test                   # Run all unit tests
npm run test -- src/app.controller.spec.ts    # Run single test file
npm run test -- --testNamePattern="test name" # Run tests matching name
npm run test:watch            # Run tests in watch mode
npm run test:cov              # Run tests with coverage report
npm run test:e2e              # Run end-to-end tests
npm run test:debug            # Debug tests with Node inspector
```

### Development

```bash
npm run start                 # Start production build
npm run start:dev            # Start with hot reload
npm run start:debug          # Start debug mode with watch
npm run start:prod           # Run production build
```

## Code Style Guidelines

### General Principles

- Follow NestJS best practices and conventions
- Use TypeScript with strict mode enabled
- Prefer explicit typing over `any` (allowed but discouraged)
- Keep functions small and focused (single responsibility)

### Naming Conventions

- **Files**: camelCase (e.g., `flights.service.ts`, `flight.code.ts`)
- **Classes**: PascalCase (e.g., `Flight`, `FlightCode`, `FlightsController`)
- **Interfaces**: PascalCase (e.g., `FlightStatus`, `CreateFlightDto`)
- **Enums**: PascalCase with PascalCase members
- **Value Objects**: PascalCase (e.g., `FlightCode`, `AirplaneSeat`)
- **Modules**: kebab-case directory names with PascalCase module classes

### File Organization

```
src/
├── module-name/
│   ├── module-name.module.ts
│   ├── module-name.controller.ts
│   ├── module-name.service.ts
│   ├── dto/
│   │   └── create.*.dto.ts
│   ├── entities/
│   │   └── *.entity.ts
│   ├── valueObjects/
│   │   └── *.ts
│   ├── types/
│   │   └── *.ts
│   └── *.spec.ts           # Unit tests co-located
```

### Import Order (grouped)

1. External NestJS/Node modules (e.g., `@nestjs/common`, `typeorm`)
2. Internal entity imports
3. Internal service/dto/value object imports

Example:

```typescript
import { Controller, Get, Body, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { CreateFlightDto } from './dto/create.flight.dto';
import { FlightsSearchService } from './flights.search.service';
```

### TypeScript Guidelines

- Use explicit return types for public methods
- Enable `strictNullChecks` (enabled in tsconfig)
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Prefer interfaces over type aliases for object shapes
- Use readonly for immutable fields in entities

### Error Handling

- Use NestJS built-in exceptions for HTTP errors:
  - `BadRequestException` - 400 errors
  - `NotFoundException` - 404 errors
  - `UnauthorizedException` - 401 errors
  - `ForbiddenException` - 403 errors
- Use plain `Error` class for domain validation in entities/value objects
- Always provide meaningful error messages

### Entity Guidelines

- Use TypeORM decorators (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`)
- Use `readonly` for fields that should not be mutated after creation
- Define validation methods in entity classes
- Use UUID for primary keys where appropriate
- Use relations (`@ManyToOne`, `@ManyToMany`) with proper eager/lazy loading

### Service Guidelines

- Inject dependencies via constructor
- Use `async/await` for all repository operations
- ReturnPromises directly from repository calls
- Handle not-found cases with appropriate exceptions

### Controller Guidelines

- Use proper HTTP method decorators (`@Get`, `@Post`, `@Patch`, `@Put`, `@Delete`)
- Use `@Body()`, `@Param()`, `@Query()` for request data
- Use `@HttpCode()` to set explicit status codes
- Validate DTOs with class-validator in DTO definitions

### DTO Guidelines

- Use class-validator decorators for validation
- Use class-transformer for parsing
- Create separate DTOs for create, update, and response operations

### Testing Guidelines

- Create `.spec.ts` files co-located with source files
- Use `@nestjs/testing` Test module:
  ```typescript
  const module: TestingModule = await Test.createTestingModule({
    controllers: [MyController],
    providers: [MyService],
  }).compile();
  ```
- Follow AAA pattern: Arrange, Act, Assert
- Use descriptive test names describing the scenario

### Database

- Uses TypeORM with PostgreSQL (config in `ormConfig.ts`)
- SQLite available for testing (config in `ormConfigTest.ts`)
- Uses migrations for schema management

### Configuration

- Environment variables in `.env.local`
- Use `@nestjs/config` for configuration injection
- Prettier config: single quotes, trailing commas
- ESLint: TypeScript ESLint with Prettier integration

### Dependencies

- Key packages: NestJS, TypeORM, TypeScript, Jest, Prettier, ESLint
- AWS SDK for S3 operations
- Nodemailer for email
- Class-validator/transformer for DTO validation
