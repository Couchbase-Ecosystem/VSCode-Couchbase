export const unionWith = <T = any>(comparator: (a: T, b: T) => boolean, ...args: T[][]) => {
  const union: T[] = [];
  args
    .reduce((acc, curr) => {
      return acc.concat(curr);
    }, [])
    .filter((el: T) => {
      if (!union.some((x) => comparator(x, el))) {
        union.push(el);
      }
      return false;
    });

  return union;
};
