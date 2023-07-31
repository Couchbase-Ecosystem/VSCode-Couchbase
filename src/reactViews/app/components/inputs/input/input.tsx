import { forwardRef, HTMLInputTypeAttribute, useId, useMemo, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import { clsx } from 'clsx';
import { IconName } from 'components/icon';
import { InputWrapper } from 'components/inputs/input-wrapper';
import { debounce } from 'utils/debounce';
import { type AllowedChars, validateString } from 'utils/validators';

export type InputProps = {
  disabled?: boolean;
  label: string;
  name: string;
  readonly?: boolean;
  value?: string;
  valid?: boolean;
  limit?: number;
  leftIcon?: IconName;
  rightIcon?: IconName;
  type?: HTMLInputTypeAttribute;
  suffix?: string;
  error?: string;
  meta?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  caseInsensitivityMatch?: string;
  existingList?: string[];
  allowedChars?: AllowedChars[];
  canNotStartWith?: string[];
  validate?: (v: string) => string;
  errors?: string[] | undefined;
  fsExclude?: boolean;
  isSlim?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onRightIconClick?: () => void;
};

const CHECK_VALIDITY_TIMEOUT = 1000;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      disabled = false,
      label,
      name,
      readonly = false,
      value = '',
      valid = false,
      limit = 0,
      leftIcon,
      rightIcon,
      type = 'text',
      suffix,
      error = '',
      meta = '',
      placeholder = '',
      required = false,
      minLength,
      maxLength,
      caseInsensitivityMatch,
      existingList,
      allowedChars,
      canNotStartWith,
      errors = [],
      validate,
      fsExclude = false,
      isSlim = false,
      onChange,
      onBlur,
      onRightIconClick,
    }: InputProps,
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [inputErrors, setInputErrors] = useState(errors || []);
    const inputId = useId();
    const hasInputStartedRef = useRef(false);

    const setFocus = () => {
      setIsInputFocused(true);
    };

    const clearFocus = () => {
      setIsInputFocused(false);
    };

    const internalValidate = useMemo(
      () =>
        validateString({
          required,
          minLength,
          maxLength,
          isEmail: type === 'email',
          caseInsensitivityMatch,
          validate,
          existingList,
          allowedChars,
          canNotStartWith,
        }),
      [required, minLength, maxLength, type, caseInsensitivityMatch, validate, existingList, allowedChars, canNotStartWith]
    );

    const checkErrorsOnInputChange = useMemo(
      () =>
        debounce((value: string) => {
          setInputErrors(internalValidate(value));
          hasInputStartedRef.current = true;
        }, CHECK_VALIDITY_TIMEOUT),
      [internalValidate]
    );

    const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      if (onChange && (limit <= 0 || value.length <= limit)) {
        checkErrorsOnInputChange(value);
        onChange(event);
      }
    };

    const onInputBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
      clearFocus();
      if (onBlur) {
        onBlur(event);
      }
    };

    const isInputValid = !inputErrors.length;
    const errorMessageToDisplay = inputErrors.length && hasInputStartedRef.current ? `${label}${inputErrors[0]}` : error;

    return (
      <InputWrapper
        disabled={disabled}
        label={label}
        id={inputId}
        readonly={readonly}
        value={value}
        valid={valid}
        labelIcon={leftIcon}
        rightIcon={rightIcon}
        error={errorMessageToDisplay}
        meta={meta}
        focused={isInputFocused}
        limit={limit}
        suffix={suffix}
        fsExclude={fsExclude}
        isSlim={isSlim}
        onRightIconClick={onRightIconClick}
      >
        <input
          id={inputId}
          className={clsx(
            disabled
              ? 'bg-inactive text-on-inactive placeholder-on-inactive'
              : 'text-on-background placeholder-on-background-alternate bg-transparent',
            'block w-full border-0 p-0 leading-5 focus:ring-0 focus:outline-0',
            { 'pl-5': leftIcon, 'text-sm': isSlim }
          )}
          ref={mergeRefs([inputRef, ref])}
          data-validate
          onFocus={setFocus}
          onBlur={onInputBlur}
          type={type}
          disabled={disabled}
          data-is-valid={isInputValid}
          name={name}
          placeholder={placeholder}
          aria-required={required}
          value={value}
          onChange={(event) => onInputChange(event)}
        />
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';
