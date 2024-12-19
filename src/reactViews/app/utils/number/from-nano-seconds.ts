import { isNumber } from './is-number';

export const fromNanoSeconds = (ns: number): string => {
  if (isNumber(ns)) {
    const ms = Math.round(ns / 1000000);
    return `${ms} ms`;
  }
  return 'NaN';
};
