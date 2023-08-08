import { ButtonProps, ButtonVariant, IconOnlyButtonProps, IconOnlyButtonVariant } from './button.types';

export const getButtonClassByVariant = (variant: ButtonVariant, isDisabled: boolean) => {
  switch (variant) {
    case 'secondary':
      return isDisabled
        ? 'remove-text-node button rounded text-on-background-alternate text-base cursor-default'
        : 'remove-text-node button button--primary-inverse';

    case 'secondary-table':
      return 'remove-text-node button button--primary-inverse button--table';

    case 'quick-start':
      return 'remove-text-node button button--surface-inverse';

    case 'danger-secondary':
      return 'remove-text-node button button--danger-inverse';

    case 'danger-secondary-table':
      return 'remove-text-node button button--danger-inverse button--table';

    case 'tertiary':
      return 'remove-text-node button button--plain';

    case 'tertiary-text':
      return isDisabled
        ? 'text-on-background-alternate text-base cursor-default'
        : 'border-none text-primary text-base hover:text-primary-hover hover:fill-primary-hover';

    case 'quaternary':
      return 'remove-text-node button button--plain button--minimal';

    case 'quinary':
      return 'remove-text-node button button--plain button--minimal-xs';

    case 'senary':
      return 'remove-text-node button button--plain button--minimal-xs bg-inherit border-none';

    case 'marketing':
      return isDisabled
        ? 'bg-on-background-decoration text-base text-on-background-alternate border-on-background-decoration fill-on-background-alternate cursor-default shadow-sm px-5 py-3 font-medium'
        : "bg-primary border-primary text-on-primary text-base hover:bg-primary-hover active:bg-primary-active fill-on-primary shadow-sm px-5 py-3 font-medium'";

    default:
      return 'remove-text-node button button--primary';
  }
};

export const getButtonIconClassByVariant = (variant: IconOnlyButtonVariant) => {
  switch (variant) {
    case 'success':
      return 'text-on-success hover:bg-on-success-decoration hover:fill-background fill-on-success bg-transparent';
    case 'warning':
      return 'text-on-warning hover:bg-on-warning-decoration fill-on-warning bg-transparent';
    case 'secondary-error':
      return 'text-on-background hover:bg-on-background-decoration fill-on-error bg-transparent';
    case 'secondary':
      return 'text-on-background hover:bg-on-background-decoration active:bg-primary fill-primary active:fill-on-primary bg-transparent';
    case 'surface':
      return 'bg-transparent text-on-surface active:bg-surface fill-on-surface active:fill-on-surface-decoration hover:fill-on-surface-decoration';
    case 'primary':
      return 'bg-background text-on-background hover:bg-on-background-decoration active:bg-primary fill-on-background active:fill-on-primary';
    default:
      throw new Error(`Unexpected variant ${variant}`);
  }
};

export const isIconOnlyButton = (props: ButtonProps): props is IconOnlyButtonProps => 'iconOnly' in props && props.iconOnly;
