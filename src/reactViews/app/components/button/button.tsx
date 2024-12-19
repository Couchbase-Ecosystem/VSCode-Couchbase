import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Icon } from 'components/icon/icon';
import { Spinner } from 'components/spinner/spinner';
import { Tooltip } from 'components/tooltip';
import { ButtonProps } from './button.types';
import { getButtonClassByVariant, getButtonIconClassByVariant, isIconOnlyButton } from './button.utils';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { type = 'button', children, className, disabled = false } = props;

  if (isIconOnlyButton(props)) {
    const { variant = 'primary', icon, iconClassName, iconOnly, label, size = 'default', dataAutoId, ...propsToPass } = props;

    return (
      <button
        {...propsToPass}
        data-auto-id={dataAutoId ? `${dataAutoId}-button` : undefined}
        type="button"
        className={clsx(
          disabled ? 'bg-background text-on-background-alternate fill-on-background-alternate ' : getButtonIconClassByVariant(variant),
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          className
        )}
        disabled={disabled}
      >
        {label && <span className="sr-only">{label}</span>}
        <div className={clsx(variant === 'secondary' && 'fill-primary', 'remove-text-node')}>
          <Icon name={icon} size={size} className={iconClassName} />
        </div>
      </button>
    );
  }

  const {
    icon,
    iconPosition = 'left',
    variant = 'primary',
    loading = false,
    block = false,
    contentClassName,
    spinnerSize = 'button',
    tooltip,
    dataAutoId,
    ...propsToPass
  } = props;

  const iconClassName = clsx('button__icon', variant === 'tertiary-text' && 'button__icon-tertiary-text');

  const renderButton = () => {
    return (
      <button
        {...propsToPass}
        data-auto-id={dataAutoId ? `${dataAutoId}-button` : undefined}
        ref={ref}
        // eslint-disable-next-line react/button-has-type
        type={type}
        disabled={loading || disabled}
        className={clsx(
          icon && iconPosition === 'left' && 'button--icon-left',
          ((icon && iconPosition === 'right') || loading) && 'button--icon-right',
          getButtonClassByVariant(variant, disabled),
          block ? 'w-full flex' : 'inline-flex',
          'items-center justify-center border font-medium leading-5',
          className
        )}
      >
        {icon && iconPosition === 'left' && (
          <span className={iconClassName}>
            <Icon name={icon} />
          </span>
        )}
        {children && <span className={clsx('button__text inline-block', contentClassName)}>{children}</span>}
        {!loading && icon && iconPosition === 'right' && (
          <span className="button__icon">
            <Icon name={icon} />
          </span>
        )}

        {loading && (
          <span className={iconClassName}>
            <Spinner size={spinnerSize} />
          </span>
        )}
      </button>
    );
  };

  return tooltip ? <Tooltip renderContent={() => tooltip}>{renderButton()}</Tooltip> : renderButton();
});

Button.displayName = 'Button';
