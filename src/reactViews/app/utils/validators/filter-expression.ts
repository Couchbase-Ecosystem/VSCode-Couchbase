/**
 * validateFilterExpression applies a regex pattern match to ensure a filter expression is valid
 *
 * @param filterExpression
 */
export const validateFilterExpression = (filterExpression: string): boolean => {
  if (
    filterExpression.match(/(REGEXP_CONTAINS\(\w*\(?\)?\.?\w+(.\w+)*, "(?:[^\\"]|\\\\|\\")*"\))|((EXISTS|DATE)\(\w*\(?\)?\.?\w+(.\w+)*\))/)
  ) {
    return true;
  }
  return false;
};
