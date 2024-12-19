import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import { clsx } from 'clsx';
import { IconName } from 'components/icon';
import { Chip } from 'components/inputs/autocomplete/chip/chip';
import { InputWrapper } from 'components/inputs/input-wrapper';
import { useClickOutside } from 'hooks/use-click-outside/use-click-outside';
import { Option } from 'types/options';
import { Context, MultiStepValue } from './multi-step-input.types';
import { asList, hasValue, isComplete, isListValue, isMultiStepValue, last, toString } from './multi-step-input.utils';

type MultiStepInputProps = {
  disabled?: boolean;
  label: string;
  name: string;
  readonly?: boolean;
  value: MultiStepValue | MultiStepValue[] | null;
  valid?: boolean;
  leftIcon?: IconName;
  error?: string;
  meta?: string;
  multiple?: boolean;
  placeholder?: string;
  required?: boolean;
  primaryOptions: Option[] | null;
  primaryLabel: string;
  secondaryOptions: Option[] | null;
  secondaryLabel: string;
  onInput?: (context: Context, value: string) => void;
  onSelect?: (context: Context, value: MultiStepValue) => void;
  onClear?: () => void;
  setRequiredError?: (context: Context, formId: string) => void;
  id?: string;
  formId: string;
};

export const MultiStepInput = forwardRef<HTMLInputElement, MultiStepInputProps>(
  (
    {
      disabled = false,
      label,
      name,
      readonly = false,
      value,
      valid,
      leftIcon,
      error = '',
      meta = '',
      multiple = false,
      placeholder = '',
      required = false,
      primaryOptions = null,
      primaryLabel,
      secondaryOptions = null,
      secondaryLabel,
      onInput,
      onSelect,
      onClear,
      setRequiredError,
      id,
      formId,
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [open, setOpen] = useState(false);
    const selected = useRef(-1);
    const [internal, setInternal] = useState('');
    const [options, setOptions] = useState<Option[] | null>(null);
    const [values, setValues] = useState(value);
    const inputEl = useRef<null | HTMLInputElement>(null);
    const divEl = useRef<null | HTMLDivElement>(null);
    const newId = useId();
    const idValue = id || newId;

    const showInput = multiple || !isComplete(last(values));
    const dirty = !!internal || !!value;
    const context = !last(values) || !hasValue(values) || isComplete(last(values)) ? 'primary' : 'secondary';
    useEffect(() => {
      if (dirty && !focused && !open && required && setRequiredError) {
        if (!values) {
          setRequiredError('primary', formId);
        }

        if (isMultiStepValue(values)) {
          if (!values.primary) {
            setRequiredError('primary', formId);
          }

          if (values.primary && !values.secondary) {
            setRequiredError('secondary', formId);
          }
        }
      }
    }, [values, dirty, focused, open, required, setRequiredError, formId]);

    useEffect(() => {
      setOptions(context === 'primary' ? primaryOptions || [] : secondaryOptions || []);
    }, [values, context, primaryOptions, secondaryOptions]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = (event.target as HTMLInputElement).value;

      if (onInput) {
        onInput(context as Context, newValue);
      }
      setInternal(newValue);
      setOpen(!!newValue);
    };

    const setFocus = () => {
      setFocused(true);
      setOpen(true);
    };

    const selectOption = (context: Context, option: Option) => () => {
      let multiStepValue: MultiStepValue;
      let rest = isListValue(values, multiple) ? values || [] : [];

      if (context === 'primary') {
        multiStepValue = { primary: option };
      } else {
        const lastItem = last(values) ?? { primary: null };
        multiStepValue = { ...lastItem, secondary: option };
        if (isListValue(values, multiple)) {
          rest = values?.slice(0, (values.length || 0) - 1) || [];
        }
      }

      if (isListValue(values, multiple)) {
        const alreadySelected = rest.find((option: MultiStepValue) => {
          let isSelected = false;
          if (option?.primary && multiStepValue?.primary && option?.secondary && multiStepValue?.secondary) {
            isSelected =
              option.primary.value === multiStepValue?.primary?.value && option.secondary.value === multiStepValue?.secondary.value;
          }
          return isSelected;
        });

        setValues(alreadySelected ? rest : [...rest, multiStepValue]);
      } else {
        setInternal('');
        selected.current = -1;
        setValues(multiStepValue);
      }

      if (onSelect) {
        onSelect(context as Context, multiStepValue);
      }

      if (!multiple && context === 'secondary') {
        setOpen(false);
      }

      if (multiple && inputEl.current) {
        inputEl.current.focus();
      } else if (divEl.current) {
        divEl.current.focus();
      }
    };

    const removeValue = (opt: MultiStepValue) => () => {
      if (disabled) {
        return;
      }
      if (onClear) {
        onClear();
      }
      if (isListValue(values, multiple)) {
        const newValue =
          values?.filter(
            (filteredValue) =>
              !(filteredValue?.primary?.value === opt?.primary?.value && filteredValue?.secondary?.value === opt?.secondary?.value)
          ) || [];
        setValues(newValue);
      } else {
        setValues({});
      }
      inputEl.current?.focus();
    };
    // TODO: use useAutocomplete hook
    const onTabKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (open) {
        const menuItems = divEl.current?.querySelectorAll('[role="option"]');
        let selectedIndexOption = [...(menuItems || [])].findIndex((element) => element === document.activeElement);
        if (event.shiftKey) {
          selectedIndexOption -= 1;
        } else {
          selectedIndexOption += 1;
        }
        selected.current = selectedIndexOption;
        if (selectedIndexOption >= menuItems!.length) {
          setFocused(false);
          selected.current = -1;
        }
      } else {
        setFocused(false);
        selected.current = -1;
      }
    };

    const onEscapeKeydown = () => {
      setOpen(false);
      selected.current = -1;
      setFocused(false);
    };

    const onArrowDownKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (focused || open) {
        event.preventDefault();
      }

      if (!open) {
        setOpen(true);
      }
      const menuItems = divEl.current?.querySelectorAll('[role="option"]');
      if (!menuItems || !menuItems.length) {
        return;
      }
      const selectedMenuItemElement = () => {
        return menuItems[selected.current] as HTMLElement;
      };

      if (selected.current >= 0) {
        selectedMenuItemElement().blur();
      }
      if (selected.current < 0) {
        selected.current = 0;
      } else if (selected.current + 1 >= menuItems.length) {
        selected.current = 0;
      } else {
        selected.current += 1;
      }

      selectedMenuItemElement().focus();
    };

    const onArrowUpKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (focused || open) {
        event.preventDefault();
      }
      if (!open) {
        setOpen(true);
      }
      const menuItems = divEl.current?.querySelectorAll('[role="option"]');
      if (!menuItems || !menuItems.length) {
        return;
      }
      const selectedMenuItemElement = () => {
        return menuItems[selected.current] as HTMLElement;
      };

      if (selected.current >= 0) {
        selectedMenuItemElement().blur();
      }
      if (selected.current < 0) {
        selected.current = menuItems.length - 1;
      } else if (selected.current - 1 < 0) {
        selected.current = menuItems.length - 1;
      } else {
        selected.current -= 1;
      }

      selectedMenuItemElement().focus();
    };

    const onEnterKeydown = () => {
      if (focused && !open) {
        setOpen(true);
      } else {
        if (!options || !options.length) {
          return;
        }

        const selectedIndexOption = selected.current < 0 ? 0 : selected.current;
        selectOption(context as Context, options[selectedIndexOption])();
      }
    };

    const onBackspaceKeydown = () => {
      if (!internal && hasValue(values)) {
        if (isListValue(values, multiple)) {
          const newValue = values?.slice(0, (values.length || 0) - 1) ?? [];
          setValues(newValue);
        } else if (context === 'secondary' && !values?.secondary && values?.primary?.value) {
          setValues({});
          if (onInput) {
            onInput('primary', '');
          }
        } else {
          setValues({});
          if (onInput) {
            onInput(context as Context, '');
          }
        }
        inputEl.current?.focus();
        selected.current = -1;
      }
    };

    const onDeleteKeydown = () => {
      if (!multiple && hasValue(values)) {
        if (isListValue(values, multiple)) {
          const newValue = values?.slice(0, (values.length || 0) - 1) ?? [];
          setValues(newValue);
        } else if (context === 'secondary' && !values?.secondary && values?.primary?.value) {
          setValues({});
          if (onInput) {
            onInput('primary', '');
          }
        } else {
          setValues({});
          if (onInput) {
            onInput(context as Context, '');
          }
        }
        inputEl.current?.focus();
        selected.current = -1;
      }
    };

    const onKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'Tab':
          return onTabKeydown(event);
        case 'Escape':
          return onEscapeKeydown();
        case 'ArrowDown':
          return onArrowDownKeydown(event);
        case 'ArrowUp':
          return onArrowUpKeydown(event);
        case 'Enter':
          return onEnterKeydown();
        case 'Backspace':
          return onBackspaceKeydown();
        case 'Delete':
          return onDeleteKeydown();
        default:
          return null;
      }
    };

    useClickOutside(divEl, () => {
      setOpen(false);
      setFocused(false);
    });

    return (
      <div
        role="button"
        className="relative w-full focus:outline-none"
        ref={divEl}
        onKeyDown={(event) => onKeydown(event)}
        onFocus={() => setFocused(true)}
        tabIndex={-1}
      >
        <InputWrapper
          disabled={disabled}
          label={label}
          labelIcon={leftIcon}
          id={idValue}
          readonly={readonly}
          value=""
          valid={!!valid}
          error={error}
          meta={meta}
          focused={focused}
        >
          {readonly && (
            <div>
              {asList(values).map((chip) => (
                <Chip key={chip.primary?.label} chipType="status" status="info">
                  <span>{toString(chip)}</span>
                </Chip>
              ))}
            </div>
          )}
          <div className="mr-2 flex flex-wrap items-end gap-1 w-full">
            {asList(values).map((chip) => {
              return disabled ? (
                <Chip key={chip.primary?.label} chipType="status" status="info">
                  <span>{toString(chip)}</span>
                </Chip>
              ) : (
                <Chip key={chip.primary?.label} chipType="input" altTextClose="remove" onClose={removeValue(chip)}>
                  <span>{toString(chip)}</span>
                </Chip>
              );
            })}
            {showInput && (
              <div className="flex grow">
                <input
                  ref={mergeRefs([inputEl, ref])}
                  autoComplete="off"
                  type="text"
                  disabled={disabled}
                  name={name}
                  id={idValue}
                  className={clsx(
                    'flex w-full shrink border-0 bg-transparent p-0 leading-5 text-on-background placeholder-on-background-alternate focus:ring-0 focus:outline-0',
                    disabled && 'bg-inactive text-on-inactive',
                    leftIcon && 'pl-4'
                  )}
                  placeholder={hasValue(values) ? undefined : placeholder}
                  onChange={handleChange}
                  value={internal}
                  aria-required={required}
                  onFocus={setFocus}
                  onClick={() => setOpen(true)}
                />
              </div>
            )}
          </div>
        </InputWrapper>
        {options?.length && open && (
          <div
            className={clsx(
              'flex flex-col absolute z-10 max-h-60 min-w-[200px] overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-on-background-decoration ring-opacity-5 focus:outline-none sm:text-sm',
              !error ? 'mt-0.5' : 'mt-1'
            )}
            tabIndex={-1}
            role="listbox"
            aria-labelledby={idValue}
            id={`${idValue}-menu`}
            data-testid="options-menu"
            aria-activedescendant={selected.current < 0 ? undefined : `${idValue}-option-${selected}`}
          >
            <button className="px-3 py-1 uppercase text-on-background-alternate" type="button">
              {context === 'primary' ? primaryLabel : secondaryLabel}
            </button>
            {options?.map((option, index) => (
              <button
                type="button"
                key={option.label}
                className="relative cursor-default select-none py-2 pl-3 pr-9 text-on-background hover:cursor-pointer hover:bg-information hover:text-on-information focus:bg-information focus:outline-none"
                id={`${idValue}-option-${index}`}
                role="option"
                aria-selected={index === selected.current}
                tabIndex={open ? 0 : -1}
                onClick={selectOption(context as Context, option)}
              >
                <div className="flex">
                  <span className="truncate">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

MultiStepInput.displayName = 'MultiStepInput';
