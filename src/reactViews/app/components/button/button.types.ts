import { ComponentProps } from 'react';
import { IconName, IconSize } from 'components/icon';
import { SpinnerSize } from 'components/spinner/spinner.types';

export type DefaultButtonProps = ComponentProps<'button'> & {
  icon?: IconName;
  tooltip?: React.ReactNode;
  iconPosition?: ButtonIconPosition;
  iconClassName?: string;
  variant?: ButtonVariant;
  loading?: boolean;
  block?: boolean;
  contentClassName?: string;
  spinnerSize?: SpinnerSize;
  dataAutoId?: string;
};

export type IconOnlyButtonProps = ComponentProps<'button'> & {
  icon: IconName;
  iconOnly: true;
  iconClassName?: string;
  variant?: IconOnlyButtonVariant;
  label?: string;
  size?: IconSize;
  dataAutoId?: string;
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

export type IconOnlyButtonVariant = 'primary' | 'secondary' | 'secondary-error' | 'warning' | 'surface' | 'success' | 'copy' | 'accordion';

export type ButtonIconPosition = 'left' | 'right';
