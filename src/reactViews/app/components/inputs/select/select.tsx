import { Fragment, useCallback, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { clsx } from 'clsx';
import { Icon } from 'components/icon';
import { Chip } from 'components/inputs/autocomplete/chip/chip';
import { Spinner } from 'components/spinner/spinner';
import { useClickOutside } from 'hooks/use-click-outside/use-click-outside';
import { SelectOption, SelectProps, SelectValue } from './select.types';
import {
  getFilteredOptionsByGroup,
  getFreeformInputKeydownHandler,
  getOptionsByGroup,
  getOptionsByValue,
  getWrapperKeydownHandler,
} from './select.utils';

export function Select<T extends SelectValue | Array<SelectValue>>({ ...props }: SelectProps<T>) {
  type ValueToSet = T extends Array<SelectValue> ? T[number] : T;
  type ChangeValue = Parameters<(typeof props)['onChange']>[0];

  // "props" are used in utils, so I keep whole object and destructuring it below
  const {
    options,
    error,
    meta,
    disabled,
    icon,
    loading,
    label,
    suppressMeta,
    chipStatus,
    withPortal,
    className,
    required,
    renderContent,
    unknownOptionFallback = 'Unknown',
  } = props;

  const [menuVisible, setMenuVisible] = useState(false);
  const uid = useId();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const listElementRef = useRef<HTMLUListElement>(null);
  const [searchPhrase, setSearchPhrase] = useState('');
  const popper = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    placement: 'bottom-end',
    modifiers: [{ name: 'flip', options: { padding: 12 } }],
  });

  const slim = !!('slim' in props && props.slim);
  const labelLeft = !!('labelLeft' in props && props.labelLeft);
  const filtered = 'filtered' in props;
  const freeform = 'freeform' in props;
  const placeholder = ('placeholder' in props && props.placeholder) || '';
  const submitEventKeys = ('submitEventKeys' in props && props.submitEventKeys) || [];
  const singleValueVisibility = props.value !== '' && props.value !== null;
  const showValue = freeform || (Array.isArray(props.value) ? props.value.length > 0 : singleValueVisibility);
  const filteredPlaceholder = !menuVisible && !showValue;
  const renderPlaceholder = filtered ? filteredPlaceholder : !showValue;
  const renderFilterInput = filtered && menuVisible && !showValue;
  const renderFreeformInput = freeform;
  const renderContentFromCustomFunction = renderContent;

  const optionsByValue = getOptionsByValue(options);
  const optionsByGroup = getOptionsByGroup(options);
  const filteredOptionsByGroup = getFilteredOptionsByGroup(optionsByGroup, searchPhrase);

  const getDisplayValue = () => {
    if (props.value) {
      if (renderContentFromCustomFunction) {
        return props.value;
      }
      return optionsByValue.get(props.value as ValueToSet)?.label || unknownOptionFallback;
    }
    return '';
  };

  const hideMenu = useCallback(() => {
    setSearchPhrase('');
    setMenuVisible(false);
  }, [setSearchPhrase, setMenuVisible]);

  const showMenu = () => {
    setMenuVisible(true);
  };

  const toggleMenu = () => {
    if (disabled) {
      return;
    }

    if (menuVisible) {
      hideMenu();
    } else {
      showMenu();
    }
  };

  const pickOption = (optionValue: ValueToSet) => {
    if (Array.isArray(props.value)) {
      props.onChange([...props.value, optionValue] as ChangeValue);
    } else {
      props.onChange(optionValue as ChangeValue);
    }

    hideMenu();
  };

  const removeOption = (optionValue: ValueToSet) => {
    if (disabled) {
      return;
    }

    if (Array.isArray(props.value)) {
      props.onChange(props.value.filter((itemValue) => itemValue !== optionValue) as ChangeValue);
      hideMenu();
    } else if (filtered) {
      props.onChange(null as ChangeValue);
    }
  };

  const toggleOption = (option: SelectOption<ValueToSet>) => {
    const isOptionSelected = Array.isArray(props.value) ? props.value.includes(option.value) : props.value === option.value;
    if (!isOptionSelected) {
      pickOption(option.value);
    } else {
      removeOption(option.value);
    }
  };

  const onFreeformInputKeydown = freeform
    ? getFreeformInputKeydownHandler({
        value: props.value as any,
        submitEventKeys,
        pickOption,
        removeOption,
      })
    : () => {};

  const onWrapperKeydown = getWrapperKeydownHandler({
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
  });

  useClickOutside([{ current: referenceElement }, { current: popperElement }], hideMenu);

  const popperElementBoundingRect = popper.state?.elements.reference.getBoundingClientRect();

  const dropdownContent = renderContentFromCustomFunction ? (
    <div
      className={clsx('z-50 overflow-y-auto rounded border border-on-background-decoration bg-background w-100', !menuVisible && 'hidden')}
      ref={setPopperElement}
      style={{ ...popper.styles.popper, width: popperElementBoundingRect?.width }}
      {...popper.attributes.popper}
    >
      {renderContent(hideMenu)}
    </div>
  ) : (
    menuVisible && (
      <div
        className="z-50 overflow-y-auto rounded border border-on-background-decoration bg-background w-100"
        ref={setPopperElement}
        style={{
          ...popper.styles.popper,
          width: popper.state?.elements.reference.getBoundingClientRect().width,
          maxHeight: 384,
        }}
        {...popper.attributes.popper}
      >
        <ul tabIndex={-1} role="listbox" aria-labelledby={uid} ref={listElementRef}>
          {Object.entries(filteredOptionsByGroup).map(([group, options]) => (
            <Fragment key={group}>
              {group && (
                <li className="py-[.625rem] px-[.875rem] text-xs font-medium uppercase text-on-background border-[.125rem] focus:border-dotted focus:border-primary border-transparent">
                  {group}
                </li>
              )}
              {options.map((option) => {
                const isOptionSelected = Array.isArray(props.value) ? props.value.includes(option.value) : props.value === option.value;

                return (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <li
                    key={String(option.value)}
                    className={clsx(
                      'py-[.625rem] px-[.875rem] first-of-type:rounded-t last-of-type:rounded-b hover:bg-on-background-decoration leading-normal flex border-[.125rem] focus:border-dotted focus:border-primary border-transparent',
                      isOptionSelected && 'font-medium bg-information hover:bg-information',
                      !isOptionSelected && 'font-normal',
                      option.disabled && 'cursor-auto text-on-background-alternate',
                      !option.disabled && 'text-on-background cursor-pointer'
                    )}
                    tabIndex={-1}
                    id={`listbox-option-${option.label}`}
                    role="option"
                    aria-selected={isOptionSelected}
                    aria-disabled={option.disabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleOption(option);
                    }}
                  >
                    {option.icon && (
                      <div className="mr-2 rounded p-2">
                        <Icon name={option.icon} />
                      </div>
                    )}
                    <div>
                      <p className="truncate font-medium">{option.label || unknownOptionFallback}</p>
                      {option.description && <p className="whitespace-normal text-xs text-on-background-alternate">{option.description}</p>}
                    </div>
                  </li>
                );
              })}
            </Fragment>
          ))}
        </ul>
      </div>
    )
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="group w-full" onKeyDown={onWrapperKeydown}>
      {label && labelLeft && (
        <span
          className={clsx(
            'block truncate text-xs font-medium mr-2',
            error && 'text-on-error-decoration',
            !error && 'text-on-background-alternate',
            !disabled && 'group-hover:text-primary-hover'
          )}
          id={uid}
        >
          {label}
        </span>
      )}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <div
        className={clsx(
          'px-3 rounded-md flex border-on-background-decoration',
          !slim && 'border py-2',
          slim && 'border-2 py-1',
          error && 'border-on-error-decoration',
          disabled && filtered && 'bg-on-background-decoration',
          disabled && !filtered && 'bg-inactive',
          disabled && 'cursor-auto',
          !disabled && filtered && 'bg-transparent',
          !disabled && !filtered && 'bg-background',
          !disabled && 'cursor-pointer',
          !disabled && !error && 'group-hover:border-primary-hover',
          !error && menuVisible && 'group-hover:border-primary-active border-primary-active',
          className
        )}
        ref={setReferenceElement}
        onClick={toggleMenu}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={menuVisible}
        aria-labelledby={uid}
        aria-disabled={disabled}
      >
        {icon && (
          <div
            className={clsx(
              'mr-2 fill-on-background-alternate',
              !error && menuVisible && 'fill-primary-active group-hover:fill-primary-active',
              error && 'fill-on-error-decoration',
              !error && 'group-hover:fill-primary-hover'
            )}
          >
            <Icon name={icon} size="small" />
          </div>
        )}
        <div className="block flex-1 truncate">
          {label && !labelLeft && (
            <span
              className={clsx(
                'block truncate text-xs font-medium',
                filtered && 'select-none',
                error && 'text-on-error-decoration',
                !error && 'text-on-background-alternate',
                !error && !disabled && 'group-hover:text-primary-hover',
                !error && menuVisible && 'text-primary-active group-hover:text-primary-active'
              )}
              id={uid}
            >
              {label}
            </span>
          )}
          {renderFilterInput && (
            <input
              tabIndex={-1}
              required={required}
              className="mt-1 block w-full truncate border-none p-0 leading-none outline-0 focus:ring-0"
              type="text"
              autoComplete="off"
              placeholder="Type..."
              value={searchPhrase}
              onChange={({ target }) => {
                setSearchPhrase(target.value);
              }}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              id={`${uid}-input`}
            />
          )}
          {showValue && (
            <div className={clsx('flex flex-row flex-wrap', !freeform && 'gap-2', freeform && 'gap-1 mr-2')}>
              {Array.isArray(props.value) ? (
                <>
                  {props.value.map((optionValue) => {
                    const option = optionsByValue.get(optionValue as ValueToSet);

                    const optionLabel = option?.label || optionValue; // optionValue is fallback for freeform

                    return (
                      <Chip
                        key={String(optionLabel)}
                        chipType={disabled ? 'status' : 'input'}
                        status={chipStatus}
                        onClose={() => {
                          removeOption(optionValue as ValueToSet);
                        }}
                        altTextClose="remove"
                        iconLeft={option?.icon}
                      >
                        {optionLabel}
                      </Chip>
                    );
                  })}
                </>
              ) : (
                <span
                  className={clsx(
                    'block truncate text-base text-on-background',
                    label && 'mt-1.5',
                    slim && 'leading-normal',
                    !slim && 'leading-none'
                  )}
                >
                  {getDisplayValue()}
                </span>
              )}
              {renderFreeformInput && (
                <div className="flex grow">
                  <input
                    required={required}
                    autoComplete="off"
                    type="text"
                    disabled={disabled}
                    className={clsx(
                      disabled && 'bg-inactive text-on-inactive',
                      'flex w-full shrink border-0 bg-transparent p-0 leading-5 text-on-background placeholder-on-background-alternate focus:ring-0 outline-0'
                    )}
                    onKeyDown={onFreeformInputKeydown}
                  />
                </div>
              )}
            </div>
          )}
          {renderPlaceholder && (
            <span
              className={clsx(
                'block truncate text-on-background-alternate my-[0.5px]',
                !filtered && 'text-base leading-normal',
                filtered && 'mt-1.5 select-none leading-none pointer-events-none'
              )}
            >
              {placeholder}
            </span>
          )}
        </div>
        <div
          className={clsx(
            'ml-2 flex items-center fill-on-background-alternate transition-transform duration-150 ease-in-out',
            !menuVisible && '-rotate-180',
            !error && menuVisible && 'fill-primary-active group-hover:fill-primary-active',
            error && 'fill-on-error-decoration',
            !error && 'group-hover:fill-primary-hover'
          )}
        >
          {loading && <Spinner size="select" />}
          {!loading && <Icon name="chevron-up" />}
        </div>
      </div>

      {withPortal ? createPortal(dropdownContent, document.body) : dropdownContent}

      {!suppressMeta && (error || meta) && (
        <p
          className={clsx(
            'min-h-[1.25rem] mt-1 px-3 pt-1 text-xs',
            error && 'text-on-error-decoration',
            !error && 'text-on-background-alternate'
          )}
        >
          {error || meta}
        </p>
      )}
    </div>
  );
}
