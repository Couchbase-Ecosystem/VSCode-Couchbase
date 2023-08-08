import { humanizeNumber } from './humanize-number';
import { isInteger } from './is-integer';

/**
 * Returns a decimal number as a string with a fixed number of decimal places
 */
export const fixedDecimal = (value: number, places: number): string => {
  return isInteger(value) ? humanizeNumber(value) : humanizeNumber(value, places);
};
