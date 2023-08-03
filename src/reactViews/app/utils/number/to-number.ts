export const toNumber = (value?: string | null): number => {
  return parseFloat(value || '0');
};
