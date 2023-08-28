import { fixedDecimal } from 'utils/number';
import type { ByteMeasurement, ByteUnit, ByteUnitLabel, ByteValue, DisplayOptions, Opts } from './bytes.utils.helpers';
import {
  BINARY_MEASUREMENT,
  BinaryByteUnit,
  binaryByteUnits,
  byteUnits,
  DECIMAL_MEASUREMENT,
  DecimalByteUnit,
  decimalByteUnits,
  DEFAULT_DECIMAL_PLACES,
  defaultOpts,
} from './bytes.utils.helpers';

export const isBinaryUnit = (unit?: ByteUnitLabel): unit is BinaryByteUnit => {
  return Object.values(binaryByteUnits).includes(unit as BinaryByteUnit);
};

export const isDecimalUnit = (unit?: ByteUnitLabel): unit is DecimalByteUnit => {
  return Object.values(decimalByteUnits).includes(unit as DecimalByteUnit);
};

export const toByteUnit = (label: ByteUnitLabel): ByteUnit => {
  let values: ByteUnitLabel[] = [];
  let keys: ByteUnit[] = [];
  if (isBinaryUnit(label)) {
    values = Object.values(binaryByteUnits);
    keys = Object.keys(binaryByteUnits) as ByteUnit[];
  } else {
    values = Object.values(decimalByteUnits);
    keys = Object.keys(decimalByteUnits) as ByteUnit[];
  }
  const idx = values.findIndex((u) => u === label);
  return keys[idx] || 'B';
};

const byteUnitToString = (byteValue: ByteValue): ByteUnitLabel => {
  const byteUnit = byteValue.measurement === 'binary' ? binaryByteUnits : decimalByteUnits;
  return byteUnit[byteValue.unit];
};

export const byteValueToString = (bv: ByteValue, opts?: Opts) => {
  const places = opts?.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
  return `${fixedDecimal(bv.value, places)} ${byteUnitToString(bv)}`;
};

/**
 * Returns the base bytes per unit (`1024` or `1000`)
 *
 * @example
 * ```
 * getByteMeasurement('binary'); // -> 1024
 * ```
 *
 * @example
 * ```
 * getByteMeasurement('decimal'); // -> 1000
 * ```
 */
const getByteMeasurement = (measurement: ByteMeasurement) => {
  return measurement === 'binary' ? BINARY_MEASUREMENT : DECIMAL_MEASUREMENT;
};

const toPow = (unit: ByteUnit): number => {
  return byteUnits.findIndex((u) => u === unit);
};

const determineBytes = (n: number, unit: ByteUnit, measurement: ByteMeasurement) =>
  Math.round(n * getByteMeasurement(measurement) ** toPow(unit));

/**
 * Determines the byte unit of a given value
 *
 * This function will recursively walk up the different byte sizes
 * until the value is less than the byte measurement (1024 or 1000)
 */

const getByteValue = (byteValue: ByteValue, forceUnit?: ByteUnit): ByteValue => {
  const byteMeasurement = getByteMeasurement(byteValue.measurement);
  // if the current value is less than the next highest level
  // return the current ByteUnit + Value
  if ((!forceUnit && byteValue.value < byteMeasurement) || byteValue.unit === forceUnit) {
    return byteValue;
  }
  return getByteValue(
    {
      bytes: byteValue.bytes,
      measurement: byteValue.measurement,
      unit: byteUnits[toPow(byteValue.unit) + 1],
      value: byteValue.value / byteMeasurement,
    },
    forceUnit
  );
};

const getDecimalPlaceMultiplier = (places: number): number => {
  const n = 10;
  const multiplier = n ** (places <= 0 ? 1 : places);
  return multiplier;
};

const roundDecimals = (n: number, options?: Opts) => {
  const opts = { ...defaultOpts, ...options };
  const decimalPlaces = opts?.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
  const multiplier = getDecimalPlaceMultiplier(decimalPlaces);
  // multiplier will always be 10 at the lowest
  const num = Math.round(n * multiplier) / multiplier;
  return decimalPlaces <= 0 ? Math.floor(num) : num;
};

const transformValue = (opts: Opts, value: number) => roundDecimals(value, opts);

/**
 * Normalizes input to a number
 *
 * @example
 * ```
 * getVal('2'); // returns "2":
 * ```
 * @example
 * ```
 * getVal('not-a-number'); // returns "0":
 * ```
 */
const getVal = (value: string | number): number => {
  if (value === undefined || value === null) {
    return 0;
  }
  return typeof value === 'string' ? Number(value) || 0 : value;
};

/**
 * Returns `true` if a value is `null` or `undefined`
 */
const isNil = (val: unknown): val is undefined => {
  return val === null || val === undefined;
};

export function toByteValue(value: string | number, options?: Opts, outputOptions?: Opts): ByteValue {
  const opts = { ...defaultOpts, ...options };
  const val = getVal(value);
  const unit = opts.unit || 'B';
  const measurement = isNil(opts.measurement) ? 'decimal' : opts.measurement;
  const bytes = determineBytes(val, unit, measurement);
  let byteValue = getByteValue({
    bytes,
    measurement,
    unit,
    value: bytes === 0 ? 0 : val,
  });

  if (outputOptions) {
    byteValue = getByteValue(
      {
        bytes,
        measurement: outputOptions.measurement || measurement,
        unit: 'B',
        value: bytes,
      },
      outputOptions.unit
    );
  }

  return {
    ...byteValue,
    value: transformValue(opts, byteValue.value),
  };
}

export const bytesToString = (val?: number | null, opts?: Opts): string => {
  const result = toByteValue(val || 0, opts);
  return byteValueToString(result, opts);
};

export const determineDecimalPlaces = (byteValue: ByteValue): number => {
  if (byteValue.unit === 'B' || byteValue.unit === 'kB') {
    return 0;
  }
  if (byteValue.value > 2_000) {
    return 0;
  }
  if (byteValue.value > 100) {
    return 1;
  }
  if (byteValue.value > 1) {
    return 2;
  }
  return 3;
};

export const displayBytes = (
  bytes: number,
  opts: DisplayOptions = {
    inputUnit: 'bytes',
    measurement: 'binary',
  }
): string => {
  const inputUnit = opts.inputUnit ?? 'bytes';
  // a label 'byte' appears in both binary and decimal measurements.
  // this will result in the first (binary) being the default measurement
  const measurement = opts?.measurement || (isBinaryUnit(inputUnit) ? 'binary' : 'decimal');

  const unit = toByteUnit(inputUnit);

  const outMeasurement = (opts.outputUnit && (isBinaryUnit(opts.outputUnit) ? 'binary' : 'decimal')) || undefined
  const outUnit = (((opts.outputUnit && toByteUnit(opts.outputUnit)) || undefined) || undefined) || undefined;

  const byteValue = toByteValue(bytes, { measurement, unit, decimalPlaces: 4 }, { measurement: outMeasurement, unit: outUnit });
  const decimalPlaces = opts?.decimalPlaces ?? determineDecimalPlaces(byteValue);

  return byteValueToString(byteValue, { decimalPlaces });
};
