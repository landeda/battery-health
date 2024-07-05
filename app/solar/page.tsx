'use client';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getSolarStorageBatteryInfo } from '@/utils/solar-storage';

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
  cycleCount: z.number().min(0),
  cycleCountUnit: z.union([
    z.literal('day'),
    z.literal('week'),
    z.literal('month'),
    z.literal('year'),
  ]),
  grossCapacity: z.number().min(0),
  netCapacity: z.number().min(0),
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
  cycleCount: 1,
  cycleCountUnit: 'day',
  grossCapacity: 2,
  netCapacity: 1.8,
  temperature: 20,
  soc: 50,
  temperatureUnit: 'C',
};

type ChartValueName = 'capacity' | 'degradation' | 'cycleCount' | 'power' | 'soh';

const chartValueFormatters: Record<ChartValueName, (value: number) => string> = {
  capacity: (value: number) => `${value.toFixed(2)}kWh`,
  degradation: (value: number) => `${value.toFixed(2)}%`,
  cycleCount: (value: number) => value.toFixed(0),
  power: (value: number) => `${value.toFixed(0)}kWh`,
  soh: (value: number) => `${value.toFixed(2)}%`,
};

const createTooltipFormatter = () => (value: number, name: ChartValueName) =>
  chartValueFormatters[name](value);

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
    const dataResult = formValuesSchema.safeParse(values);
    if (!dataResult.success) {
      return;
    }

    const pointCount = Math.min(dataResult.data.duration * 12, 500);

    const results: {
      time: number;
      capacity: number;
      degradation: number;
      cycleCount: number;
      power: number;
      soh: number;
    }[] = [];

    for (let i = 0; i < pointCount + 1; i++) {
      const info = getSolarStorageBatteryInfo({
        ...dataResult.data,
        duration: (i * dataResult.data.duration) / pointCount,
      });
      const lastResult = results[i - 1];
      let power = 0;
      if (lastResult) {
        const cycleCountDelta = info.cycleCount - lastResult.cycleCount;
        const meanSohPercent = (info.soh + lastResult.soh) / 2;
        const meanSoh = meanSohPercent / 100;
        const powerDelta = cycleCountDelta * meanSoh * dataResult.data.netCapacity;
        power = lastResult.power + powerDelta;
      }

      results.push({
        time: i / pointCount,
        capacity: info.endCapacity,
        degradation: info.degradation,
        cycleCount: info.cycleCount,
        power,
        soh: info.soh,
      });
    }

    setChartData(results);
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
  const tooltipFormatter = useMemo(() => createTooltipFormatter(), []);

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
                id="cycleCount"
                label="Cycle count"
                Left={
                  <Input
                    type="number"
                    id="cycleCount"
                    required
                    min="0"
                    {...form.register('cycleCount', { valueAsNumber: true })}
                  />
                }
                Right={
                  <Select
                    id="cycleCountUnit"
                    aria-controls="cycleCount"
                    aria-label="Cycle count unit"
                    required
                    {...form.register('cycleCountUnit')}>
                    {['day', 'week', 'month', 'year'].map((value) => (
                      <option key={value} value={value}>
                        {value}
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
          <ResponsiveContainer className=" bg-white w-full min-h-[80vh] md:min-h-auto max-h-[80vh] rounded-2xl p-2 pt-12">
            <ComposedChart data={chartData} margin={{ top: 4, left: -10, right: 20, bottom: 4 }}>
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
                dataKey="power"
                yAxisId="power"
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
              <YAxis yAxisId="power" orientation="right" hide />
              <YAxis yAxisId="soh" orientation="right" domain={[0, 100]} hide />
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
