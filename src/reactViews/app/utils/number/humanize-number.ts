/**
 * Pretty print a number
 *
 * @example
 * Here's an example with a number great than 1,000
 *
 * ```
 * humanizeNumber(1234.56)
 * // "1,234.56"
 * ```
 *
 * @example
 * Here's an example for truncating a decimal number
 *
 * ```
 * humanizeNumber(123.454321, 4)
 * // "123.4543"
 * ```
 */
export const humanizeNumber = (num: number, places?: number): string => {
  let value = num;
  // If a `places` argument was provided, then use it to modify the num value
  if (places !== undefined) {
    // const multiplier = Math.pow(10, places || 0); // use ** instead of Math.pow
    const multiplier = 10 ** (places || 0);
    value = Math.round((num || 0) * multiplier) / multiplier;
  }

  return value
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: places,
        maximumFractionDigits: places,
      })
    : '0';
};
