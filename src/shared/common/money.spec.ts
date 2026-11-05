import { ValueTransformer } from 'typeorm';
import { moneyColumn, roundMoney } from './money';

describe('roundMoney', () => {
  it.each([
    [0, 0],
    [100, 100],
    [99.99, 99.99],
    [1.234, 1.23],
    [1.236, 1.24],
    [334.125, 334.13],
  ])('rounds %d to %d', (amount, expected) => {
    expect(roundMoney(amount)).toBe(expected);
  });

  it.each([
    [1.005, 1.01],
    [1.235, 1.24],
    [8.345, 8.35],
    [10.075, 10.08],
    [1234.565, 1234.57],
    [1000000.005, 1000000.01],
  ])('rounds the half cent in %d up to %d', (amount, expected) => {
    expect(roundMoney(amount)).toBe(expected);
  });

  it('removes floating point noise', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(0.1 * 3)).toBe(0.3);
    expect(roundMoney(1.1 + 2.2)).toBe(3.3);
  });

  it('keeps the largest amount the column can store', () => {
    expect(roundMoney(9999999999.99)).toBe(9999999999.99);
  });
});

describe('moneyColumn', () => {
  const transformer = moneyColumn.transformer as ValueTransformer;

  it('stores two decimals in a numeric column', () => {
    expect(moneyColumn).toMatchObject({
      type: 'numeric',
      precision: 12,
      scale: 2,
    });
  });

  it.each([
    ['99.99', 99.99],
    ['150.00', 150],
    ['0.00', 0],
  ])('reads the driver value "%s" as the number %d', (stored, expected) => {
    expect(transformer.from(stored)).toBe(expected);
  });

  it('reads a value that is already a number', () => {
    expect(transformer.from(12.5)).toBe(12.5);
  });

  it('writes the number unchanged', () => {
    expect(transformer.to(99.99)).toBe(99.99);
  });

  it('allows adding loaded values as numbers rather than joining text', () => {
    const basePrice = transformer.from('100.50') as number;
    const increment = transformer.from('10.25') as number;

    expect(basePrice + increment).toBe(110.75);
  });
});
