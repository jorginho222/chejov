import { ColumnOptions } from 'typeorm';

export const roundMoney = (amount: number): number =>
  Math.round(Number((amount * 100).toPrecision(15))) / 100;

// The Postgres driver returns numeric values as strings, which would make
// arithmetic like `basePrice + increment` concatenate text
export const moneyColumn: ColumnOptions = {
  type: 'numeric',
  precision: 12,
  scale: 2,
  transformer: {
    to: (value: number): number => value,
    from: (value: string | number): number => Number(value),
  },
};
