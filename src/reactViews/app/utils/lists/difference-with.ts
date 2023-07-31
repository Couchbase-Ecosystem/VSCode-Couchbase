export const differenceWith = <T>(comparator: (a: T, b: T) => boolean, array: T[], ...args: T[][]) => {
  const union: T[] = args.reduce((acc, curr) => {
    return acc.concat(curr);
  }, []);

  return array.filter((el) => {
    return union.every((x) => !comparator(el, x));
  });
};
