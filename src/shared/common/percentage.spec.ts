import { Percentage } from './percentage';

describe('Percentage', () => {
  it.each([0, 10, 12.5, 150])('returns the value %d', (value) => {
    expect(new Percentage(value).getValue()).toBe(value);
  });

  it('changes the value', () => {
    const percentage = new Percentage(10);

    percentage.setValue(25.5);

    expect(percentage.getValue()).toBe(25.5);
  });

  it.each([
    [10, '10%'],
    [12.5, '12.5%'],
    [0, '0%'],
  ])('formats %d as %s', (value, expected) => {
    expect(new Percentage(value).toString()).toBe(expected);
  });
});
