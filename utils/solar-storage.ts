import { getCalendarDegradation } from './common/calendar-ageing';
import { CHEMISTRIES_PROPERTIES, Chemistry } from './common/chemistries-properties';
import { getCyclingDegradation, getCycleDegradation } from './common/cycle-ageing';
import { DurationUnit, getDayDuration } from './common/duration';
import { TemperatureUnit, convertToCelcius } from './common/temperature';

type GetSolarStorageBatteryInfoParams = {
  chemistry: Chemistry;
  cycleCountTo80: number;
  duration: number;
  durationUnit: DurationUnit;
  cycleCount: number;
  cycleCountUnit: DurationUnit;
  grossCapacity: number;
  netCapacity: number;
  temperature: number;
  temperatureUnit: TemperatureUnit;
  soc: number;
};

export const getSolarStorageBatteryInfo = ({
  chemistry,
  duration,
  durationUnit,
  temperature,
  temperatureUnit,
  grossCapacity,
  netCapacity,
  cycleCountTo80,
  cycleCount,
  cycleCountUnit,
  soc,
}: GetSolarStorageBatteryInfoParams) => {
  const dayDuration = getDayDuration(duration, durationUnit);
  const cycleCountPerDay = getDayDuration(cycleCount, cycleCountUnit);
  const celciusTemperature = convertToCelcius(temperature, temperatureUnit);

  const calendarAgeingDegradation = getCalendarDegradation({
    chemistry,
    dayDuration,
    celciusTemperature,
    soc,
  });

  const singleCycleDegradation = getCycleDegradation(cycleCountTo80);
  const cyclesDegradation = getCyclingDegradation(
    singleCycleDegradation,
    dayDuration * cycleCountPerDay
  );

  const endCapacity = grossCapacity * (1 - calendarAgeingDegradation) * (1 - cyclesDegradation);

  const degradation = ((grossCapacity - endCapacity) / grossCapacity) * 100;
  const soh = Math.min(100 - ((netCapacity - endCapacity) / netCapacity) * 100, 100);

  const meanSoh = (100 + soh) / 2;
  // const totalPower = (meanSoh / 100) * netCapacity * cycleCountPerDay * dayDuration;

  return {
    cycleCount: cycleCountPerDay * dayDuration,
    degradation,
    endCapacity,
    soh,
  };
};
