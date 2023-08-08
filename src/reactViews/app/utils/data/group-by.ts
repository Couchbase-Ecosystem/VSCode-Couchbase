export const groupBy = <T>(data: T[], groupByProperty: (dataItem: T) => string): Record<string, T[]> => {
  const map = new Map();
  data.forEach((item) => {
    const key = groupByProperty(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return Object.fromEntries(map);
};
