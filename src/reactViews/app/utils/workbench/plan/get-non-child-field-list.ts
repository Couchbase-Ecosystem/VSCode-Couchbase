import { Plan } from 'types/plan';

const childFieldNames = /#operator|~child*|delete|update|scans|first|second|inputs/;

const getNonChildFieldList = (operator: Plan['operator']) => {
  let result = '';

  Object.keys(operator!).forEach((field) => {
    if (!field.match(childFieldNames)) {
      const val = operator![field as keyof typeof operator];
      // add the field name as a list item
      result += `<li>${field}`;

      // for a primitive value, just add that as well
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        result += ` - ${val}`;
      }
      // if it's an array, create a sublist with a line for each item
      else if (Array.isArray(val)) {
        result += '<ul>';
        (val as Plan[]).forEach((item) => {
          if (typeof item === 'string') result += `<li>${item}</li>`;
          else result += getNonChildFieldList(item);
        });
        result += '</ul>';
      }

      // if it's an object, have a sublist for it
      // this was originally `_.isPlainObject`
      else if (typeof val === 'object' && typeof val !== 'function') {
        result += '<ul>';
        result += getNonChildFieldList(val as Plan['operator']);
        result += '</ul>';
      }
      result += '</li>';
    }
  });

  return result;
};

export default getNonChildFieldList;
