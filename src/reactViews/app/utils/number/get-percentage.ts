import { isNumber } from './is-number';

export const getPercentage = (numerator: number, divisor: number): number => {
  if (!isNumber(numerator) || !isNumber(divisor) || divisor === 0) {
    return 0;
  }

  return Math.floor((numerator / divisor) * 100);
};
