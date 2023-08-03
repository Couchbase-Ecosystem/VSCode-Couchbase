export const toInt = (value?: string | null): number => {
  return parseInt(value || '0', 10);
};
