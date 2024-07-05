'use client';
import { UseFormReturn, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEvBatteryLife } from '@/utils/electric-vehicule';
import { Line, XAxis, YAxis, Tooltip, Area, ComposedChart, ResponsiveContainer } from 'recharts';
import {
  addDays,
  addYears,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  subYears,
} from 'date-fns';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { JoinedField } from '@/components/JoinedField';
import { Field } from '@/components/Field';
import { addMonths } from 'date-fns/addMonths';
import { addWeeks } from 'date-fns/addWeeks';
import { subMonths } from 'date-fns/subMonths';
import { FieldsGroup } from '@/components/FieldsGroup';

const formValuesSchema = z.object({
  chemistry: z.union([z.literal('LFP'), z.literal('LMO-NMC')]),
  duration: z.number().min(0),
  cycleCountTo80: z.number().min(0).int(),
  durationUnit: z.union([
    z.literal('day'),
    z.literal('week'),
    z.literal('month'),
    z.literal('year'),
  ]),
  distance: z.number().min(0),
  distanceUnit: z.union([
    z.literal('day'),
    z.literal('week'),
    z.literal('month'),
    z.literal('year'),
  ]),
  grossCapacity: z.number().min(0),
  netCapacity: z.number().min(0),
  consumption: z.number().min(0),
  consumptionUnit: z.union([z.literal('km'), z.literal('miles')]),
  soc: z.number().int().min(0).max(100),
  temperature: z.number(),
  temperatureUnit: z.union([z.literal('C'), z.literal('F'), z.literal('K')]),
});
type FormValues = z.infer<typeof formValuesSchema>;

const defaultValues: FormValues = {
  chemistry: 'LFP',
  cycleCountTo80: 3000,
  duration: 10,
  durationUnit: 'year',
  distance: 1200,
  distanceUnit: 'month',
  grossCapacity: 44,
  netCapacity: 42,
  consumption: 17,
  consumptionUnit: 'km',
  temperature: 15,
  soc: 50,
  temperatureUnit: 'C',
};

type ChartValueName = 'capacity' | 'degradation' | 'cycleCount' | 'distance' | 'soh';

const chartValueFormatters: Record<
  ChartValueName,
  (value: number, options: CreateTooltipFormatterOptions) => string
> = {
  capacity: (value: number) => `${value.toFixed(2)}kWh`,
  degradation: (value: number) => `${value.toFixed(2)}%`,
  cycleCount: (value: number) => value.toFixed(0),
  distance: (value: number, { distanceUnit }) => `${value.toFixed(0)} ${distanceUnit}`,
  soh: (value: number) => `${value.toFixed(2)}%`,
};

type CreateTooltipFormatterOptions = {
  distanceUnit: string;
};

const createTooltipFormatter =
  (options: CreateTooltipFormatterOptions) => (value: number, name: ChartValueName) =>
    chartValueFormatters[name](value, options);

function formatDistanceToNowCustom(date: Date) {
  const now = new Date();
  const years = differenceInYears(date, now);
  const months = differenceInMonths(subYears(date, years), now);
  const weeks = differenceInWeeks(subMonths(subYears(date, years), months), now);
  let result = '';
  if (years > 0) {
    result += `${years}y`;
  }
  if (months > 0) {
    if (result) {
      result += ' ';
    }
    result += `${months}m`;
  }
  if (weeks > 0) {
    if (result) {
      result += ' ';
    }
    result += `${weeks}w`;
  }

  return result || '0m';
}

const useChartData = (form: UseFormReturn<FormValues>) => {
  const values = form.watch();
  const [chartData, setChartData] = useState<any>([]);

  useEffect(() => {
    const result = formValuesSchema.safeParse(values);
    if (!result.success) {
      return;
    }

    let pointCount = Math.min(result.data.duration * 12, 500);

    setChartData(
      Array.from({ length: pointCount + 1 }, (_, i) => {
        const usage = getEvBatteryLife({
          ...result.data,
          duration: (i * result.data.duration) / pointCount,
        });
        return {
          time: i / pointCount,
          capacity: usage.endCapacity,
          degradation: usage.degradation,
          cycleCount: usage.cycleCount,
          distance: usage.distance,
          soh: usage.soh,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Array.from(Object.values(values)));

  return chartData;
};

export default function Home() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formValuesSchema),
    defaultValues,
    mode: 'onChange',
    shouldFocusError: true,
    reValidateMode: 'onChange',
  });
  const { duration, durationUnit } = form.watch();
  const chartData = useChartData(form);

  const distanceUnit = form.watch('consumptionUnit');

  const tooltipFormatter = useMemo(
    () => createTooltipFormatter({ distanceUnit: distanceUnit }),
    [distanceUnit]
  );

  const tickFormatter = useCallback(
    (time: number) => {
      const addUnit = {
        day: addDays,
        week: addWeeks,
        month: addMonths,
        year: addYears,
      };

      return formatDistanceToNowCustom(addUnit[durationUnit](new Date(), time * duration));
    },
    [duration, durationUnit]
  );
  return (
    <div className="flex md:flex-row flex-col gap-4 md:gap-8">
      <FormProvider {...form}>
        <form>
          <div className="flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-col lg:min-w-80 gap-4">
            <FieldsGroup title="Battery Specifications">
              <Field id="chemistry" label="Chemistry">
                <Select id="chemistry" required {...form.register('chemistry')}>
                  {['LFP', 'LMO-NMC'].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="cycleCountTo80" label="Cycles to 80%">
                <Input
                  type="number"
                  id="cycleCountTo80"
                  required
                  min="0"
                  {...form.register('cycleCountTo80', { valueAsNumber: true })}
                />
              </Field>
              <Field id="grossCapacity" label="Gross capacity (kWh)">
                <Input
                  type="number"
                  id="grossCapacity"
                  required
                  min="0"
                  {...form.register('grossCapacity', { valueAsNumber: true })}
                />
              </Field>
              <Field id="netCapacity" label="Net capacity (kWh)">
                <Input
                  type="number"
                  id="netCapacity"
                  required
                  min="0"
                  {...form.register('netCapacity', { valueAsNumber: true })}
                />
              </Field>
            </FieldsGroup>
            <FieldsGroup title="Usage">
              <JoinedField
                id="duration"
                label="Duration"
                Left={
                  <Input
                    type="number"
                    id="duration"
                    required
                    min="0"
                    {...form.register('duration', { valueAsNumber: true })}
                  />
                }
                Right={
                  <Select
                    id="durationUnit"
                    aria-controls="duration"
                    aria-label="Duration unit"
                    required
                    {...form.register('durationUnit')}>
                    {['day', 'week', 'month', 'year'].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                }
              />
              <JoinedField
                id="consumption"
                label="Consumption"
                Left={
                  <Input
                    type="number"
                    id="consumption"
                    required
                    min="0"
                    {...form.register('consumption', { valueAsNumber: true })}
                  />
                }
                Right={
                  <Select
                    id="consumptionUnit"
                    aria-controls="consumption"
                    aria-label="Consumption unit"
                    required
                    {...form.register('consumptionUnit')}>
                    {['km', 'miles'].map((value) => (
                      <option key={value} value={value}>
                        kWh/100{value}
                      </option>
                    ))}
                  </Select>
                }
              />
              <JoinedField
                id="distance"
                label={`Distance (${distanceUnit})`}
                Left={
                  <Input
                    type="number"
                    id="distance"
                    required
                    min="0"
                    {...form.register('distance', { valueAsNumber: true })}
                  />
                }
                Right={
                  <Select
                    id="distanceUnit"
                    aria-controls="distance"
                    aria-label="Distance unit"
                    required
                    {...form.register('distanceUnit')}>
                    {['day', 'week', 'month', 'year'].map((value) => (
                      <option key={value} value={value}>
                        per {value}
                      </option>
                    ))}
                  </Select>
                }
              />
            </FieldsGroup>

            <FieldsGroup title="Operational Conditions">
              <JoinedField
                id="temperature"
                label="Mean temperature"
                Left={
                  <Input
                    type="number"
                    id="temperature"
                    required
                    {...form.register('temperature', { valueAsNumber: true })}
                  />
                }
                Right={
                  <Select
                    id="temperatureUnit"
                    aria-controls="temperature"
                    aria-label="Temperature unit"
                    required
                    {...form.register('temperatureUnit')}>
                    {['C', 'F', 'K'].map((value) => (
                      <option key={value} value={value}>
                        °{value}
                      </option>
                    ))}
                  </Select>
                }
              />
              <Field id="soc" label="Mean SOC - state of charge">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  id="soc"
                  required
                  {...form.register('soc', { valueAsNumber: true })}
                />
              </Field>
            </FieldsGroup>
          </div>
        </form>
      </FormProvider>

      {chartData.length > 0 && (
        <div className="flex flex-col flex-grow-1 w-full">
          <h2 className="mb-3 text-xl font-medium">Simulation Graph</h2>
          <ResponsiveContainer className=" bg-white w-full min-h-[80vh] md:min-h-auto max-h-[80vh] rounded-2xl p-8 pb-6 pt-12">
            <ComposedChart data={chartData} margin={{ top: 5, left: -28, right: 5, bottom: 5 }}>
              <Area
                type="monotone"
                dataKey="capacity"
                stroke="var(--primary-500)"
                fill="var(--primary-300)"
              />
              <Line
                type="monotone"
                dot={false}
                dataKey="degradation"
                yAxisId="degradation"
                stroke="var(--red-500)"
              />
              <Line
                type="monotone"
                dot={false}
                dataKey="cycleCount"
                yAxisId="cycleCount"
                stroke="var(--blue-500)"
              />
              <Line
                type="monotone"
                dot={false}
                dataKey="distance"
                yAxisId="distance"
                stroke="var(--green-500)"
              />
              <Line type="monotone" dot={false} dataKey="soh" yAxisId="soh" stroke="orange" />
              <XAxis
                dataKey="time"
                type="number"
                tickCount={8}
                domain={[0, 1]}
                ticks={Array.from({ length: 10 + 1 }, (_, i) => i / 10)}
                tickFormatter={tickFormatter}
              />

              <YAxis />
              <YAxis yAxisId="degradation" orientation="left" domain={[0, 100]} hide />
              <YAxis yAxisId="cycleCount" orientation="right" hide />
              <YAxis yAxisId="distance" orientation="right" hide />
              <YAxis yAxisId="soh" orientation="right" hide />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                labelFormatter={tickFormatter}
                formatter={tooltipFormatter}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
