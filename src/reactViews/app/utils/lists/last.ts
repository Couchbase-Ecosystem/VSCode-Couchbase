export const last = <T>(array: T[]): T | undefined => {
  if (!array.length) {
    return undefined;
  }
  return array[array.length - 1];
};
