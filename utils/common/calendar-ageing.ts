import { CHEMISTRIES_PROPERTIES, Chemistry } from './chemistries-properties';

type GetCalendarDegradationParams = {
  chemistry: Chemistry;
  dayDuration: number;
  celciusTemperature: number;
  soc: number;
};

export const getCalendarDegradation = ({
  chemistry,
  dayDuration,
  celciusTemperature,
  soc,
}: GetCalendarDegradationParams) => {
  const chemistryProperties = CHEMISTRIES_PROPERTIES[chemistry];

  return (
    chemistryProperties.a0 *
    Math.exp(chemistryProperties.b * celciusTemperature) *
    Math.pow(dayDuration, chemistryProperties.kSoc(soc))
  );
};
