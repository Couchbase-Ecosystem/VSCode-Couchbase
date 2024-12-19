import type { IconName } from 'components/icon';

export type FieldValue = string | number | boolean;
export type Option<T = FieldValue, R = never> = {
  label: string;
  value: T;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
  group?: string;
  data?: R extends never ? never : R;
};
