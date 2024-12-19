import { sdks } from 'constants/sdks';
import { PriorityLevel } from 'constants/support';
import { Option } from './support-ticket-form.types';

export function getChipStatus(impactPriority: PriorityLevel) {
  if (impactPriority === 'P1') {
    return 'error';
  }
  if (impactPriority === 'P2') {
    return 'warning';
  }
  if (impactPriority === 'P3') {
    return 'info';
  }
  return 'notice';
}

export const sdkOptions: Option[] = sdks.map(({ key, label }) => ({
  label,
  value: key,
}));

export const sdkOptionsObject: { [key: string]: string } = {};
sdkOptions.forEach(({ label, value }) => {
  sdkOptionsObject[value] = label;
});
