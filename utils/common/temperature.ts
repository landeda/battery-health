export type TemperatureUnit = 'C' | 'F' | 'K';

export const convertToCelcius = (value: number, unit: TemperatureUnit) => {
  if (unit === 'C') return value;
  if (unit === 'F') return ((value - 32) * 5) / 9;
  if (unit === 'K') return value - 273.15;
  throw new Error(`Unsupported unit: ${unit}`);
};
