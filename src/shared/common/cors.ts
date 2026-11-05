// The Angular dev server, used when CORS_ORIGINS is not set
export const DEFAULT_CORS_ORIGINS = ['http://localhost:4200'];

// The cors package's default methods leave out QUERY, used by flight search
export const CORS_METHODS = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'QUERY',
];

/**
 * Parses a comma-separated list of allowed origins, such as
 * "http://localhost:4200,https://admin.example.com".
 */
export function parseCorsOrigins(value: string | undefined): string[] {
  const origins = (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    // Browsers send the Origin header without a trailing slash
    .map((origin) => origin.replace(/\/+$/, ''))
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : DEFAULT_CORS_ORIGINS;
}
