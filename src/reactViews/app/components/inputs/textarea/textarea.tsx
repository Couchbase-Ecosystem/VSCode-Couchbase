import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Icon } from 'components/icon';
import { FS_EXCLUDE } from 'constants/full-story';

type TextAreaProps = {
  name?: string;
  value: string;
  placeholder?: string;
  label: string;
  id?: string;
  metaDescription?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
  fsExclude?: boolean;
  onTextAreaDoubleClick?: () => void;
} & ({ readOnly: true } | { readOnly?: false; onChange: (value: string) => void });
export const TextArea = forwardRef<HTMLTextAreaElement | null, TextAreaProps>(
  (
    {
      name = '',
      value,
      placeholder = '',
      label = '',
      id,
      metaDescription = '',
      disabled = false,
      readOnly = false,
      required = false,
      error,
      wrapperClassName,
      inputClassName,
      fsExclude = false,
      onTextAreaDoubleClick,
      ...props
    },
    ref
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const onChange = 'onChange' in props ? props.onChange : () => {};
      onChange(event.target.value);
    };

    return (
      <div className={clsx('relative w-full', fsExclude ? FS_EXCLUDE : '')}>
        <div className="peer inline-flex w-full items-center ">
          <div
            className={clsx(
              'rounded border p-3 w-full pt-2 border-on-background-decoration hover:border-primary-hover focus-within:shadow focus-within:border-primary-active bg-background',
              { 'pt-7': label },
              { 'border-on-error-decoration': error },
              { 'bg-on-background-decoration text-on-background-alternate hover:border-on-background-decoration': disabled || readOnly },
              wrapperClassName,
              inputClassName
            )}
          >
            <textarea
              onDoubleClick={onTextAreaDoubleClick}
              value={value}
              onChange={handleChange}
              ref={ref}
              placeholder={placeholder}
              id={id}
              name={name}
              required={required}
              className={clsx(
                'w-full h-20 p-0 pr-3 border-none outline-none leading-4 text-on-background focus:ring-0 placeholder:text-on-background-alternate focus:outline-none',
                { 'text-on-background-alternate bg-on-background-decoration': disabled || readOnly },
                wrapperClassName
              )}
              disabled={disabled}
              readOnly={readOnly}
            />
          </div>
          {error === true && (
            <span data-testid="error-icon" className="ml-2 fill-on-error-decoration">
              <Icon name="triangle-exclamation" />
            </span>
          )}
          {error === false && (
            <span data-testid="success-icon" className="ml-2 fill-on-success-decoration">
              <Icon name="check" />
            </span>
          )}
        </div>

        <label
          htmlFor={id}
          className={clsx(
            'block absolute top-3 left-3 text-xs leading-3 font-medium text-on-background-alternate',
            {
              'text-on-error-decoration': error,
            },
            { 'peer-hover:text-primary-hover peer-focus:text-primary-active': !disabled || readOnly }
          )}
        >
          {label}
        </label>

        <span className={clsx('ml-3 block text-xs text-on-background-alternate', { 'text-on-error-decoration': error })}>
          {metaDescription}
        </span>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
