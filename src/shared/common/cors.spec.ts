import { DEFAULT_CORS_ORIGINS, parseCorsOrigins } from './cors';

describe('parseCorsOrigins', () => {
  it('falls back to the Angular dev server when unset or blank', () => {
    expect(parseCorsOrigins(undefined)).toEqual(DEFAULT_CORS_ORIGINS);
    expect(parseCorsOrigins('')).toEqual(DEFAULT_CORS_ORIGINS);
    expect(parseCorsOrigins(' , ')).toEqual(DEFAULT_CORS_ORIGINS);
  });

  it('splits a comma-separated list and trims each origin', () => {
    expect(
      parseCorsOrigins(' http://localhost:4200 , https://admin.example.com '),
    ).toEqual(['http://localhost:4200', 'https://admin.example.com']);
  });

  it('removes trailing slashes, which never match an Origin header', () => {
    expect(parseCorsOrigins('https://admin.example.com/')).toEqual([
      'https://admin.example.com',
    ]);
  });
});
