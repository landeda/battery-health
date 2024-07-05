import { getCalendarDegradation } from './common/calendar-ageing';
import { CHEMISTRIES_PROPERTIES, Chemistry } from './common/chemistries-properties';
import { getCycleDegradation } from './common/cycle-ageing';
import { DurationUnit } from './common/duration';
import { TemperatureUnit, convertToCelcius } from './common/temperature';

type ConsumptionUnit = 'km' | 'miles';

export type GetBatteryUsageParams = {
  chemistry: Chemistry;
  cycleCountTo80: number;
  duration: number;
  durationUnit: DurationUnit;
  consumption: number;
  consumptionUnit: ConsumptionUnit;
  distance: number;
  distanceUnit: DurationUnit;
  grossCapacity: number;
  netCapacity: number;
  temperature: number;
  temperatureUnit: TemperatureUnit;
  soc: number;
};

export type GetBatteryUsageResult = {
  distance: number;
  cycleCount: number;
  degradation: number;
  endCapacity: number;
  soh: number;
};

const getDayDuration = (value: number, unit: DurationUnit) => {
  if (unit === 'day') return value;
  if (unit === 'week') return value * 7;
  if (unit === 'month') return value * 30.436875;
  if (unit === 'year') return value * 365.25;
  throw new Error(`Unsupported unit: ${unit}`);
};

const getDailyUsage = ({
  distance,
  distanceUnit,
  consumption,
}: {
  distance: number;
  distanceUnit: DurationUnit;
  consumption: number;
}) => {
  return (distance * consumption) / 100 / getDayDuration(1, distanceUnit);
};

const getDailyDistance = ({
  distance,
  distanceUnit,
}: {
  distance: number;
  distanceUnit: DurationUnit;
}) => {
  return distance / getDayDuration(1, distanceUnit);
};

export const getEvBatteryLife = ({
  chemistry,
  cycleCountTo80,
  duration,
  durationUnit,
  distance,
  distanceUnit,
  consumption,
  grossCapacity,
  netCapacity,
  temperature,
  temperatureUnit,
  soc,
}: GetBatteryUsageParams): GetBatteryUsageResult => {
  const dayDuration = getDayDuration(duration, durationUnit);
  const dailyUsage = getDailyUsage({ distance, distanceUnit, consumption });
  const celciusTemperature = convertToCelcius(temperature, temperatureUnit);
  const cycleDegradation = getCycleDegradation(cycleCountTo80);

  const calendarAgeingDegradation = getCalendarDegradation({
    chemistry,
    dayDuration,
    celciusTemperature,
    soc,
  });

  const meanCalendarAgeingCapacity =
    grossCapacity - (grossCapacity * calendarAgeingDegradation) / 2;

  const cycleCount = (dayDuration * dailyUsage) / meanCalendarAgeingCapacity;
  const cyclingDegradation = 1 - Math.pow(1 - cycleDegradation / 100, cycleCount);

  const endCapacity = grossCapacity * ((1 - calendarAgeingDegradation) * (1 - cyclingDegradation));

  const totalDistance = dayDuration * getDailyDistance({ distance, distanceUnit });
  const degradation = ((grossCapacity - endCapacity) / grossCapacity) * 100;
  const soh = Math.min(100 - ((netCapacity - endCapacity) / netCapacity) * 100, 100);

  return {
    distance: totalDistance,
    cycleCount,
    degradation,
    endCapacity,
    soh,
  };
};
