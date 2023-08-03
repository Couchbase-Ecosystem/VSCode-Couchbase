import { clsx } from 'clsx';
import { Icon, IconName } from 'components/icon';
import { FS_EXCLUDE } from 'constants/full-story';

export type InputWrapperProps = {
  label: string;
  id: string;
  value: string;
  disabled?: boolean;
  readonly?: boolean;
  valid?: boolean;
  limit?: number;
  focused?: boolean;
  labelIcon?: IconName;
  rightIcon?: IconName;
  onRightIconClick?: () => void;
  error?: string;
  meta?: string;
  hideLabel?: boolean;
  suffix?: string;
  readOnlyElement?: React.ReactNode;
  children?: React.ReactNode;
  rightIconElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
  metaElement?: React.ReactNode;
  limitElement?: React.ReactNode;
  isSlim?: boolean;
  fsExclude?: boolean;
  containerChildrenClasses?: string;
};

const metaMinHeight = { minHeight: '1.25rem' };

export function InputWrapper({
  label,
  id,
  value,
  disabled = false,
  readonly = false,
  valid = false,
  limit = 0,
  focused = false,
  labelIcon,
  rightIcon,
  onRightIconClick,
  error = '',
  meta = '',
  hideLabel = false,
  suffix,
  readOnlyElement,
  children,
  rightIconElement,
  suffixElement,
  metaElement,
  limitElement,
  isSlim = false,
  fsExclude = false,
  containerChildrenClasses,
}: InputWrapperProps) {
  const errorText = (!valid && error) || '';

  const getContainerClass = () => {
    if (error && !disabled) {
      return 'border-on-error-decoration cursor-text';
    }
    if (disabled) {
      return 'border-inactive bg-inactive';
    }
    if (focused) {
      return 'border-primary-active shadow-sm shadow-shadow cursor-text';
    }
    return 'border-on-background-decoration focus-within:border-primary-active hover:border-primary-hover cursor-text';
  };
  const getLabelClass = () => {
    if (error && !disabled) {
      return 'fill-on-error-decoration text-on-error-decoration cursor-text';
    }
    if (disabled) {
      return 'fill-on-inactive text-on-inactive';
    }
    if (focused) {
      return 'fill-primary-active group-hover:fill-primary-active text-primary-active group-hover:text-primary-active cursor-text';
    }
    return 'fill-on-background-alternate group-hover:fill-primary-hover text-on-background-alternate group-hover:text-primary-hover cursor-text';
  };

  if (readonly) {
    return (
      <div className={clsx('w-full', fsExclude && FS_EXCLUDE)}>
        <div className={clsx('px-3', isSlim ? 'py-0.5' : 'py-2')}>
          <div className={clsx({ 'mb-1': !isSlim }, 'flex')}>
            {labelIcon && (
              <span className="mr-1 fill-on-background-alternate">
                <Icon name={labelIcon} size="small" />
              </span>
            )}
            <label htmlFor={id} className={clsx('block text-xs font-medium text-on-background-alternate', { 'sr-only': hideLabel })}>
              {label}
            </label>
          </div>
          {readOnlyElement || (
            <span
              className={clsx('block h-5 w-full border-0 p-0 leading-5 text-on-background placeholder-on-background-alternate', {
                'pl-4': labelIcon,
              })}
            >
              {value}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('w-full relative', fsExclude && FS_EXCLUDE)}>
      <div
        className={clsx(
          getContainerClass(),
          'flex bg-background group rounded border pt-3 pb-2.5 focus-within:shadow-sm focus-within:shadow-shadow px-3 w-full',
          isSlim ? 'py-1' : 'pt-3 pb-2.5'
        )}
      >
        <div className={clsx('grow', { 'pr-6': rightIcon })}>
          <div className={clsx({ 'mb-1': !isSlim }, 'remove-text-node flex select-none')}>
            {labelIcon && (
              <span className={`${getLabelClass()} mr-1 inline-block`}>
                <Icon name={labelIcon} size="small" />
              </span>
            )}
            <label
              htmlFor={id}
              className={clsx(getLabelClass(), 'text-xs font-medium leading-none grow-1 w-full', { 'sr-only': hideLabel })}
            >
              {label}
            </label>
          </div>
          <div className={clsx('flex', containerChildrenClasses)}>{children}</div>
        </div>
        {suffixElement ||
          (suffix && (
            <div className="grow-0 flex items-end">
              <span className="text-base text-on-background-alternate leading-6">{suffix}</span>
            </div>
          ))}
      </div>
      {rightIconElement ||
        (rightIcon && (
          <button
            data-testid="rightIconButton"
            type="button"
            disabled={disabled}
            className={clsx(
              'border-0 bg-transparent grow-0 fill-on-background-alternate flex items-center absolute right-3 top-3 w-5 h-9',
              { 'top-1': isSlim }
            )}
            onClick={() => {
              if (onRightIconClick) {
                onRightIconClick();
              }
            }}
          >
            <Icon name={rightIcon} size="large" />
          </button>
        ))}
      {(meta || errorText || limit || valid) && (
        <div className="ml-3 mt-1 flex items-center justify-between text-xs" style={metaMinHeight}>
          {metaElement || (
            <div className="flex">
              {errorText ? (
                <>
                  <span className="mr-1 fill-on-error-decoration">
                    <Icon name="triangle-exclamation" />
                  </span>
                  <p className={clsx({ 'pb-2': isSlim }, 'text-on-error-decoration')} id={`${id}-error`}>
                    {errorText}
                  </p>
                </>
              ) : (
                <>
                  {valid && (
                    <span className="mr-1 fill-on-success-decoration">
                      <Icon name="solid-check" />
                    </span>
                  )}
                  {meta && (
                    <p className="text-on-background-alternate" id={`${id}-description`}>
                      {meta}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
          {limit > 0 &&
            (limitElement || (
              <div className="justify-self-end text-right mr-3 text-sm text-on-background-alternate self-start">
                {value.length}/{limit}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
