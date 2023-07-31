export const isNumber = (value: number | unknown): boolean => {
  return !Number.isNaN(value);
};
