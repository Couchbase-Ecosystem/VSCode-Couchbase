type PredicateFn = <T = unknown>(a: T, b: T) => boolean;

const strictEquals: PredicateFn = (a, b) => a === b;

export const listsEqual = <T = unknown>(a: T[], b: T[], predicate: PredicateFn = strictEquals): boolean => {
  const listA = [...a];
  const listB = [...b];
  if (a.length !== b.length) {
    return false;
  }
  const isEqual = listA.reduce((result, itemA) => {
    const index = listB.findIndex((itemB) => predicate(itemB, itemA));
    if (index < 0) {
      return false;
    }
    listB.splice(index, 1);
    return result;
  }, true);

  return isEqual;
};
