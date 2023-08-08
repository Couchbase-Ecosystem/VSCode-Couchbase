import { forwardRef, useId, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Icon, IconName } from 'components/icon';
import { debounce } from 'utils/debounce';
import { validateNumber } from 'utils/validators';
import { numberDotMinusRegex } from './number-field.utils';

export type NumberFieldProps = {
  disabled?: boolean;
  label: string;
  name: string;
  readonly?: boolean;
  value?: string;
  valid?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIcon?: () => void;
  native?: boolean;
  error?: string;
  errors?: string[];
  meta?: string;
  placeholder?: string;
  required?: boolean;
  min: number;
  max: number;
  step?: number;
  onChange?: (value: string) => void;
  suppressMeta?: boolean;
  variant?: 'default' | 'slim';
};

type ClassTypes = {
  containerClass: string;
  labelClass: string;
};

const CHECK_VALIDITY_TIMEOUT = 250;

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      disabled = false,
      label,
      name,
      readonly = false,
      value = '',
      valid,
      leftIcon,
      rightIcon,
      onRightIcon,
      native = false,
      error = '',
      errors = [],
      meta = '',
      placeholder = '',
      required = false,
      min,
      max,
      step = 1,
      onChange,
      suppressMeta = false,
      variant = 'default',
    },
    ref
  ) => {
    const [values, setValues] = useState(value);
    const [inputErrors, setInputErrors] = useState(errors || []);
    const internalValidate = validateNumber({ required, min, max });
    const hasInputStartedRef = useRef(false);
    const isValid = valid && !inputErrors.length;
    const errorText = inputErrors.length && hasInputStartedRef.current ? `${label}${inputErrors[0]}` : error;
    const id = useId();

    const baseClasses = (error: string, disabled: boolean): ClassTypes => {
      if (error && !disabled) {
        return { containerClass: 'border-on-error-decoration', labelClass: 'fill-on-error-decoration text-on-error-decoration' };
      }
      if (disabled) {
        return { containerClass: 'border-inactive bg-inactive', labelClass: 'fill-on-inactive text-on-inactive' };
      }
      return {
        containerClass: 'border-on-background-decoration focus-within:border-primary-active hover:border-primary-hover cursor-text',
        labelClass:
          'fill-on-background-alternate group-hover:fill-primary-hover text-on-background-alternate group-hover:text-primary-hover cursor-text',
      };
    };

    const checkErrorsOnInputChange = useMemo(
      () =>
        debounce((value: number) => {
          setInputErrors(internalValidate(value));
          hasInputStartedRef.current = true;
        }, CHECK_VALIDITY_TIMEOUT),
      [internalValidate]
    );

    const internalOnChange = (value: number) => {
      checkErrorsOnInputChange(value);
      if (onChange) {
        onChange(value.toString());
      }
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (numberDotMinusRegex.test(value)) {
        internalOnChange(Number(value));
        setValues(value);
      }
    };

    const handleIncDec = (factor: number) => {
      let numberValue = Number(values);
      numberValue += factor * step;

      if (max !== null && numberValue > max) {
        numberValue = max;
      }
      if (min !== null && numberValue < min) {
        numberValue = min;
      }
      setValues(numberValue.toString());
      internalOnChange(numberValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowUp':
          handleIncDec(1);
          break;
        case 'ArrowDown':
          handleIncDec(-1);
          break;
        default:
          break;
      }
    };

    return readonly ? (
      <div className="w-full">
        <div className="px-3 py-2">
          <div className={clsx('flex', variant === 'default' && 'mb-1')}>
            {leftIcon && (
              <span className="mr-1 fill-on-background-alternate">
                <Icon name={leftIcon} size="small" />
              </span>
            )}
            {label && (
              <label htmlFor={id} className="block text-xs font-medium text-on-background-alternate w-full">
                {label}
              </label>
            )}
          </div>
          <span
            className={
              (clsx('block h-5 w-full border-0 p-0 leading-5 text-on-background placeholder-on-background-alternate'), leftIcon && 'pl-4')
            }
          >
            {values}
          </span>
        </div>
      </div>
    ) : (
      <div className={clsx('w-full', variant === 'slim' && 'flex')}>
        <div
          className={clsx(
            'flex group rounded-md border px-3 focus-within:shadow-sm focus-within:shadow-shadow',
            baseClasses(errorText, disabled).containerClass,
            variant === 'default' ? 'py-2' : 'w-full py-0.5'
          )}
        >
          <div className="grow">
            <div className={clsx('flex', variant === 'default' && 'mb-1')}>
              {leftIcon && (
                <span className={clsx('mr-1', baseClasses(errorText, disabled).labelClass)}>
                  <Icon name={leftIcon} size="small" />
                </span>
              )}
              {label && (
                <label htmlFor={id} className={`block text-xs font-medium w-full ${baseClasses(errorText, disabled).labelClass}`}>
                  {label}
                </label>
              )}
            </div>
            <input
              type={native ? 'number' : 'text'}
              ref={ref}
              disabled={disabled}
              name={name}
              id={id}
              min={native ? min : ''}
              max={native ? max : ''}
              autoComplete={native ? 'on' : 'off'}
              value={values}
              className={clsx(
                'text-on-background block w-full border-0 p-0 placeholder-on-background-alternate focus:ring-0 leading-5 focus:outline-none',
                disabled && 'bg-inactive text-on-inactive',
                leftIcon && 'pl-4',
                !native && 'bg-transparent'
              )}
              placeholder={placeholder}
              aria-required={required}
              onChange={native ? () => {} : (event) => handleInput(event)}
              onKeyDown={native ? () => {} : (event) => handleKeyDown(event)}
            />
          </div>
          {rightIcon && (
            <button
              type="button"
              className={clsx('grow-0 fill-on-background-alternate flex items-center', !disabled && onRightIcon && 'cursor-pointer')}
              onClick={() => !disabled && onRightIcon && onRightIcon()}
            >
              <Icon name={rightIcon} size={variant === 'default' ? 'large' : 'small'} />
            </button>
          )}
          {!native && !disabled && (
            <div
              className={clsx(
                'flex  pl-3 cursor-pointer flex-col fill-on-background-alternate text-on-background-alternate',
                variant === 'default' ? 'grow-0 justify-between' : 'justify-center'
              )}
            >
              <button type="button" onClick={() => handleIncDec(1)}>
                <Icon name="chevron-up" size={variant === 'default' ? 'default' : 'small'} />
              </button>
              <button type="button" onClick={() => handleIncDec(-1)}>
                <Icon name="chevron-down" size={variant === 'default' ? 'default' : 'small'} />
              </button>
            </div>
          )}
        </div>
        {!suppressMeta && (errorText || meta || isValid) && (
          <div className="ml-3 mt-1 h-5 flex items-center justify-start">
            {errorText && (
              <>
                <span className="mr-1 fill-on-error-decoration">
                  <Icon name="triangle-exclamation" />
                </span>
                <p className="text-sm text-on-error-decoration" id={`${id}-error`}>
                  {errorText}
                </p>
              </>
            )}
            {!errorText && variant === 'slim' && (meta || isValid) && (
              <>
                {isValid && (
                  <span className="mr-1 fill-on-success-decoration" data-testid="check-icon">
                    <Icon name="solid-check" />
                  </span>
                )}
                {meta && (
                  <p className="text-sm text-on-background-alternate select-none" id={`${id}-description`}>
                    {meta}
                  </p>
                )}
              </>
            )}
            {!errorText && variant === 'default' && meta && (
              <p className="text-sm text-on-background-alternate select-none" id={`${id}-description`}>
                {meta}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

NumberField.displayName = 'NumberField';
