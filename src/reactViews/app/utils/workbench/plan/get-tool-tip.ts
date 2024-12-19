import { Plan } from 'types/plan';
import getNonChildFieldList from './get-non-child-field-list';

export const getToolTip = (plan: Plan) => {
  const tooltipInfo = plan.operator;

  if (!tooltipInfo || !tooltipInfo['#operator']) return '';

  const childFields = getNonChildFieldList(tooltipInfo);
  if (childFields.length === 0) {
    return '';
  }

  let result = '';
  result += `<div class="row"><h5>${tooltipInfo['#operator']}</h5></div><ul class="wb-explain-tooltip-list">`;

  result += childFields;
  result += '</ul>';

  return result;
};
