export type ByteMeasurement = 'binary' | 'decimal';

export type ByteUnit = (typeof byteUnits)[number];

export type BinaryByteUnit = (typeof binaryByteUnits)[ByteUnit];
export type DecimalByteUnit = (typeof decimalByteUnits)[ByteUnit];
export type ByteUnitLabel = BinaryByteUnit | DecimalByteUnit;

export type ByteSpecifier =
  | ByteUnitLabel
  | {
      measurement: ByteMeasurement;
      unit: ByteUnit;
    };

export type ByteValue = {
  bytes: number;
  measurement: ByteMeasurement;
  unit: ByteUnit;
  value: number;
};

export type DisplayOptions = {
  inputUnit?: ByteUnitLabel;
  decimalPlaces?: number;
  outputUnit?: ByteUnitLabel;
  measurement?: ByteMeasurement;
};

export type Opts = {
  decimalPlaces?: number;
  measurement?: ByteMeasurement;
  unit?: ByteUnit;
};

export const DEFAULT_DECIMAL_PLACES = 1;
export const BINARY_MEASUREMENT = 1024;
export const DECIMAL_MEASUREMENT = 1000;
export const defaultOpts: Opts = {
  decimalPlaces: DEFAULT_DECIMAL_PLACES,
  measurement: 'decimal',
  unit: 'B',
};

export const byteUnits = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const;
export const binaryByteUnits = {
  B: 'bytes',
  kB: 'KiB',
  MB: 'MiB',
  GB: 'GiB',
  TB: 'TiB',
  PB: 'PiB',
  EB: 'EiB',
  ZB: 'ZiB',
  YB: 'YiB',
} as const;

export const decimalByteUnits = {
  B: 'bytes',
  kB: 'KB',
  MB: 'MB',
  GB: 'GB',
  TB: 'TB',
  PB: 'PB',
  EB: 'EB',
  ZB: 'ZB',
  YB: 'YB',
} as const;
