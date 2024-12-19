import { IconName } from 'components/icon';
import { Status } from 'components/inputs/autocomplete/chip/chip.types';

export type SelectValue = string | number | boolean | null;

export type SelectOption<T> = {
  label: string;
  value: T;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
  group?: string;
};

export type SelectProps<T extends SelectValue | Array<SelectValue>> = {
  unknownOptionFallback?: string;
  icon?: IconName;
  disabled?: boolean;
  error?: string;
  meta?: string;
  loading?: boolean;
  slim?: boolean;
  label?: string;
  filtered?: boolean;
  labelLeft?: boolean;
  suppressMeta?: boolean;
  placeholder?: string;
  chipStatus?: Status;
  required?: boolean;
  options: Array<SelectOption<T extends Array<SelectValue> ? T[number] : T>>;
  value: T extends Array<SelectValue> ? T : T | null;
  className?: string;
  withPortal?: boolean;
  onChange: (value: T extends Array<SelectValue> ? T : T | null) => void;
  renderContent?: (hideMenuFn: () => void) => JSX.Element;
} & (
  | {
      freeform: true;
      submitEventKeys?: string[];
    }
  | {}
);
