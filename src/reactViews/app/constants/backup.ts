export const DAY_OF_WEEK = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
} as const;

export type DayOfWeek = keyof typeof DAY_OF_WEEK;

export const BACKUP_RETENTION = {
  '30days': '30 Days',
  '60days': '60 Days',
  '90days': '90 Days',
  '180days': '180 Days',
  '1years': '1 Year',
  '2years': '2 Years',
  '3years': '3 Years',
  '4years': '4 Years',
  '5years': '5 Years',
} as const;

export type BackupRetention = keyof typeof BACKUP_RETENTION;

export const HOUR_OF_DAY = {
  0: '12:00 am',
  1: '1:00 am',
  2: '2:00 am',
  3: '3:00 am',
  4: '4:00 am',
  5: '5:00 am',
  6: '6:00 am',
  7: '7:00 am',
  8: '8:00 am',
  9: '9:00 am',
  10: '10:00 am',
  11: '11:00 am',
  12: '12:00 pm',
  13: '1:00 pm',
  14: '2:00 pm',
  15: '3:00 pm',
  16: '4:00 pm',
  17: '5:00 pm',
  18: '6:00 pm',
  19: '7:00 pm',
  20: '8:00 pm',
  21: '9:00 pm',
  22: '10:00 pm',
  23: '11:00 pm',
} as const;

export type HourOfDay = keyof typeof HOUR_OF_DAY;

export const BACKUP_HOURLY_INCREMENT = {
  1: '1 Hour',
  2: '2 Hours',
  4: '4 Hours',
  6: '6 Hours',
  8: '8 Hours',
  12: '12 Hours',
} as const;
export type BackupHourlyIncrement = keyof typeof BACKUP_HOURLY_INCREMENT;

export const BACKUP_DAILY_INCREMENT = {
  1: '1 Hour',
  2: '2 Hours',
  4: '4 Hours',
  6: '6 Hours',
  8: '8 Hours',
  12: '12 Hours',
  24: '24 Hours',
} as const;
export type BackupDailyIncrement = keyof typeof BACKUP_DAILY_INCREMENT;

export const TIME_UNITS = {
  seconds: 'Seconds',
  minutes: 'Minutes',
  hours: 'Hours',
  days: 'Days',
  weeks: 'Weeks',
} as const;

export type TimeUnits = keyof typeof TIME_UNITS;
