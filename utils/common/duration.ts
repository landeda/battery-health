export type DurationUnit = 'day' | 'week' | 'month' | 'year';

export const getDayDuration = (value: number, unit: DurationUnit) => {
  if (unit === 'day') return value;
  if (unit === 'week') return value * 7;
  if (unit === 'month') return value * 30.436875;
  if (unit === 'year') return value * 365.25;
  throw new Error(`Unsupported unit: ${unit}`);
};
