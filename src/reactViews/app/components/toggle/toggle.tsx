import { clsx } from 'clsx';
import { Option } from 'types/options';

export type ToggleValue = string | number | boolean;
export type ToggleProps<T extends ToggleValue> = {
  value?: T;
  options: Option[];
  altText?: string;
  disabled?: boolean;
  onChange?: (value: T) => void;
  children?: React.ReactNode;
};

export const toggleStyle = (isSelected: boolean, disabled: boolean) => {
  if (isSelected) {
    return disabled
      ? 'bg-surface-active text-on-inactive cursor-default'
      : 'bg-primary active:bg-primary-active text-on-primary cursor-pointer';
  }
  return disabled
    ? 'cursor-default text-on-inactive'
    : clsx(
        'bg-inactive text-on-inactive active:bg-primary-active cursor-pointer ',
        'hover:bg-primary-hover hover:text-on-primary active:text-on-primary'
      );
};

export function Toggle({ disabled, options, onChange, value, altText, children }: ToggleProps<ToggleValue>) {
  return (
    <div className="inline-block">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-on-background-alternate">{children}</h2>
      </div>

      <legend className="sr-only">{altText}</legend>
      <div className="toggle-container inline-flex items-center justify-center rounded-full bg-inactive text-sm font-medium focus:outline-none">
        {options.map((option) => (
          // eslint-disable-next-line jsx-a11y/label-has-associated-control
          <label
            key={option.label}
            className={clsx(
              'sm:flex-0 flex-shrink-0 cursor-pointer rounded-full border-transparent py-1 px-3',
              toggleStyle(value === option.value, disabled || !!option.disabled)
            )}
          >
            <input
              type="radio"
              disabled={disabled || option.disabled}
              name="selected"
              value={String(option.value)}
              className="sr-only"
              onClick={(event) => {
                if (onChange) {
                  onChange((event.target as HTMLInputElement)?.value);
                }
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
