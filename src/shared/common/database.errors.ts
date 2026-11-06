import { QueryFailedError } from 'typeorm';

// Postgres error codes, from https://www.postgresql.org/docs/current/errcodes-appendix.html
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

function hasPostgresCode(
  error: unknown,
  code: string,
  constraint?: string,
): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = error.driverError as
    | { code?: string; constraint?: string }
    | undefined;
  if (driverError?.code !== code) return false;

  return constraint === undefined || driverError.constraint === constraint;
}

// A row with the same value already exists under a unique constraint. Pass
// the constraint or index name to only match that one.
export function isUniqueViolation(
  error: unknown,
  constraint?: string,
): boolean {
  return hasPostgresCode(error, UNIQUE_VIOLATION, constraint);
}

// The row is still referenced by a foreign key
export function isForeignKeyViolation(error: unknown): boolean {
  return hasPostgresCode(error, FOREIGN_KEY_VIOLATION);
}
