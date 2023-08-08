import { ComponentProps } from 'react';
import { IconName, IconSize } from 'components/icon';

export type DefaultButtonProps = ComponentProps<'button'> & {
  icon?: IconName;
  iconPosition?: ButtonIconPosition;
  iconClassName?: string;
  variant?: ButtonVariant;
  loading?: boolean;
  block?: boolean;
};

export type IconOnlyButtonProps = ComponentProps<'button'> & {
  icon: IconName;
  iconOnly: true;
  iconClassName?: string;
  variant?: IconOnlyButtonVariant;
  label?: string;
  size?: IconSize;
};

export type ButtonProps = DefaultButtonProps | IconOnlyButtonProps;

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'secondary-table'
  | 'tertiary'
  | 'tertiary-text'
  | 'quaternary'
  | 'quinary'
  | 'senary'
  | 'danger-secondary'
  | 'danger-secondary-table'
  | 'marketing'
  | 'quick-start'
  | 'danger';

export type IconOnlyButtonVariant = 'primary' | 'secondary' | 'secondary-error' | 'warning' | 'surface' | 'success';

export type ButtonIconPosition = 'left' | 'right';
