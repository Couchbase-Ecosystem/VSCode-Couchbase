import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns';

type Option = {
  label: string;
  value: number;
};

export type TimeRangeOptionType = { time: number; step: number; label: string };

export const timeRangeOptions: TimeRangeOptionType[] = [
  { time: minutesToMilliseconds(30), step: 7, label: '30m' },
  { time: hoursToMilliseconds(1), step: 15, label: '1h' },
  { time: hoursToMilliseconds(2), step: 30, label: '2h' },
  { time: hoursToMilliseconds(24), step: 360, label: '1d' },
  { time: hoursToMilliseconds(24 * 2), step: 720, label: '2d' },
  { time: hoursToMilliseconds(24 * 7), step: 2520, label: '7d' },
  { time: hoursToMilliseconds(24 * 30), step: 10800, label: '30d' },
];

export const refreshRateOptions: Option[] = [
  { label: 'Off', value: 0 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
];
