import { last } from 'utils/lists';
import { SelectOption, SelectProps, SelectValue } from './select.types';

export function getOptionsByGroup<T>(options: SelectOption<T>[]) {
  return options.reduce<{ [group: string]: SelectOption<T>[] }>((result, item) => {
    const group = item?.group || '';
    const groupItems = result[group] || [];

    return {
      ...result,
      [group]: [...groupItems, item],
    };
  }, {});
}

export function getFilteredOptionsByGroup<T>(optionsByGroup: { [group: string]: SelectOption<T>[] }, searchPhrase: string) {
  return Object.fromEntries(
    Object.entries(optionsByGroup)
      .map(([group, options]) => {
        const lowerSearchPhrase = searchPhrase.toLowerCase();
        const lowerGroup = group.toLowerCase();

        const filteredOptions = options.filter((option) => {
          const lowerOptionLabel = option.label.toLowerCase();

          return lowerOptionLabel.includes(lowerSearchPhrase) || lowerGroup.includes(lowerSearchPhrase);
        });

        return [group, filteredOptions] as const;
      })
      .filter(([, options]) => options.length > 0)
  );
}

export function getOptionsByValue<T>(options: SelectOption<T>[]) {
  const result = new Map<T, SelectOption<T>>();

  options.forEach((option) => {
    result.set(option.value, option);
  });

  return result;
}

export function getFreeformInputKeydownHandler<T>({
  value,
  submitEventKeys,
  pickOption,
  removeOption,
}: {
  value: T[];
  submitEventKeys: string[];
  pickOption: (value: T) => void;
  removeOption: (value: T) => void;
}) {
  return (event: React.KeyboardEvent<HTMLInputElement>) => {
    const freeformInput = event.target as HTMLInputElement | null;

    if (!freeformInput) {
      return;
    }

    const predefinedSubmitEventKeys = ['Enter', ...submitEventKeys];
    const shouldInsertValue = predefinedSubmitEventKeys.includes(event.key);
    const freeformValue = freeformInput.value;
    const isValueAlreadyExist = value.includes(freeformValue as T);

    if (shouldInsertValue) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (shouldInsertValue) {
      if (freeformValue !== '' && !isValueAlreadyExist) {
        pickOption(freeformInput.value as T);
      }

      freeformInput.value = '';
      return;
    }

    const shouldDeleteValue = event.key === 'Backspace';
    const lastValue = last(value);

    if (shouldDeleteValue && freeformValue === '' && lastValue) {
      removeOption(lastValue);
    }
  };
}

export function getWrapperKeydownHandler<T extends SelectValue | Array<SelectValue>, D = T extends Array<SelectValue> ? T[number] : T>({
  disabled,
  hideMenu,
  referenceElement,
  filtered,
  menuVisible,
  props,
  options,
  removeOption,
  listElementRef,
  showMenu,
  toggleOption,
  filteredOptionsByGroup,
}: {
  disabled?: boolean;
  hideMenu: () => void;
  referenceElement: HTMLElement | null;
  filtered: boolean;
  menuVisible: boolean;
  props: SelectProps<T>;
  options: SelectProps<T>['options'];
  removeOption: (value: D) => void;
  showMenu: () => void;
  listElementRef: { current: HTMLElement | null };
  toggleOption: (value: SelectOption<D>) => void;
  filteredOptionsByGroup: { [group: string]: SelectOption<D>[] };
}) {
  return (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'Tab') {
      hideMenu();
      return;
    }

    if (event.key === 'Escape') {
      hideMenu();

      if (referenceElement) {
        referenceElement.focus();
      }

      return;
    }

    if (event.key === 'Backspace') {
      if (!filtered || !menuVisible) {
        return;
      }

      const canRemove = Array.isArray(props.value) ? props.value.length === 1 : props.value !== null;

      if (!canRemove) {
        return;
      }

      const valueToRemove = Array.isArray(props.value) ? props.value[0] : props.value!;
      const optionToRemove = options.find((option) => option.value === valueToRemove);
      const isOptionDisabled = !!(optionToRemove?.disabled || false);

      if (!isOptionDisabled) {
        removeOption(valueToRemove as D);
      }

      return;
    }

    if (['Enter', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
    }

    const listOptions = [...(listElementRef.current?.querySelectorAll('[role=option]') || [])] as HTMLElement[];
    const pickedOptionIndex = listOptions.findIndex((element) => element === document.activeElement);

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const factor = event.key === 'ArrowUp' ? -1 : 1;
      let selectedItemIndex = pickedOptionIndex + factor;

      if (selectedItemIndex < 0) {
        // wrap around top
        selectedItemIndex = listOptions.length - 1;
      } else if (selectedItemIndex === listOptions.length) {
        // wrap around bottom
        selectedItemIndex = 0;
      }

      const elementToFocus = listOptions[selectedItemIndex];

      if (elementToFocus) {
        elementToFocus.focus();
      }

      return;
    }

    if (event.key === 'Enter') {
      const focusedOptionIndex = listOptions.findIndex((option) => option === document.activeElement);
      const isListOptionFocused = focusedOptionIndex !== -1;

      if (!isListOptionFocused) {
        if (!menuVisible) {
          showMenu();

          // gotta wait for menu to render
          setTimeout(() => {
            const firstItem = listOptions[0];
            if (firstItem) {
              firstItem.focus();
            }
          });
        } else {
          hideMenu();
        }
      } else {
        const orderedOptions = Object.values(filteredOptionsByGroup).flatMap((groupItems) => groupItems);
        const focusedOption = orderedOptions[focusedOptionIndex];

        if (focusedOption) {
          toggleOption(focusedOption as unknown as SelectOption<D>);
        }

        if (referenceElement) {
          referenceElement.focus();
        }
      }
    }
  };
}
