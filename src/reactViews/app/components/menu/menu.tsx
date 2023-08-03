/* eslint-disable jsx-a11y/anchor-is-valid */
import { Fragment, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { Link } from 'react-router-dom';
import { Placement } from '@popperjs/core';
import { clsx } from 'clsx';
import { Icon } from 'components/icon';
import { Tooltip } from 'components/tooltip';
import { useClickOutside } from 'hooks/use-click-outside/use-click-outside';
import { groupBy } from 'utils/data';
import { AnchorItem, ButtonItem, MenuItem, Palette } from './menu.types';

type MenuProps = {
  label?: string;
  items: MenuItem[];
  palette?: Palette;
  id?: string;
  withPortal?: boolean;
  placement?: Placement;
  offset?: [number, number];
};

function AnchorElement({ item, closeMenu }: { item: AnchorItem; closeMenu: () => void }) {
  return (
    <Link
      to={item.disabled ? '' : item.href}
      className={clsx(
        'flex items-center p-2 text-sm font-normal',
        item.disabled
          ? 'text-on-background-alternate fill-on-background-alternate cursor-default pointer-events-none'
          : 'text-on-background hover:bg-on-background-decoration'
      )}
      role="menuitem"
      tabIndex={-1}
      id="menu-item"
      onClick={closeMenu}
    >
      {item.icon && (
        <span className="pl-1">
          <Icon name={item.icon} />
        </span>
      )}
      <span className="pl-2">{item.label}</span>
    </Link>
  );
}

function ButtonElement({ item, closeMenu }: { item: ButtonItem; closeMenu: () => void }) {
  return (
    <button
      type="button"
      className={clsx(
        'flex items-center w-full text-left p-2 text-sm font-normal',
        item.disabled ? 'text-on-background-alternate fill-on-background-alternate' : 'text-on-background hover:bg-on-background-decoration'
      )}
      role="menuitem"
      tabIndex={-1}
      id="menu-item"
      onClick={(event) => {
        event.stopPropagation();
        item.onClick();
        closeMenu();
      }}
      disabled={item.disabled}
    >
      {item.icon && (
        <span className="pl-1">
          <Icon name={item.icon} />
        </span>
      )}
      <span className="pl-2">{item.label}</span>
    </button>
  );
}

export function Menu({
  label = '',
  items,
  palette = 'default',
  withPortal = false,
  placement = 'auto-end',
  offset = [-15, 10],
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const containerElementRef = useRef<null | HTMLDivElement>(null);
  const buttonElementRef = useRef<null | HTMLButtonElement>(null);
  const floatingElementRef = useRef<null | HTMLDivElement>(null);
  const itemsGroupedByGroup = groupBy(items, (item) => item.group || '');
  const { styles, attributes } = usePopper(buttonElementRef.current, floatingElementRef.current, {
    placement,
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset } }],
  });
  const id = useId();

  const isAnchorItem = (item: MenuItem): item is AnchorItem => {
    return 'href' in item;
  };

  const toggleMenu = () => {
    setOpen(!open);
  };

  const closeMenu = () => {
    setOpen(false);
  };

  useClickOutside(containerElementRef, closeMenu);

  const renderedDropdown = (
    <div
      ref={floatingElementRef}
      {...attributes.popper}
      style={styles.popper}
      className={clsx(
        open ? 'block z-50' : 'hidden',
        'absolute w-56 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-on-background-decoration ring-opacity-5 focus:outline-none overflow-hidden'
      )}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby={`${id}-menu-button`}
      tabIndex={-1}
    >
      {Object.entries(itemsGroupedByGroup).map(([group, items]) => {
        return (
          <Fragment key={group}>
            {group && <p className="px-3 pt-4 pb-2 text-xs uppercase">{group}</p>}
            {items
              .filter((item) => !item.hide)
              .map((item) => (
                <div className="inline-block w-full" key={item.label}>
                  {item.tooltip && (
                    <Tooltip placement="right" renderContent={() => <div>{item.tooltip}</div>}>
                      {isAnchorItem(item) ? (
                        <AnchorElement item={item} closeMenu={closeMenu} />
                      ) : (
                        <ButtonElement item={item} closeMenu={closeMenu} />
                      )}
                    </Tooltip>
                  )}
                  {!item.tooltip &&
                    (isAnchorItem(item) ? (
                      <AnchorElement item={item} closeMenu={closeMenu} />
                    ) : (
                      <ButtonElement item={item} closeMenu={closeMenu} />
                    ))}
                </div>
              ))}
          </Fragment>
        );
      })}
    </div>
  );

  return (
    <div ref={containerElementRef} className="inline-block text-left">
      <div>
        {label ? (
          <button
            ref={buttonElementRef}
            type="button"
            className="inline-flex w-full justify-center rounded-md border border-on-background-decoration bg-background px-4 py-2 text-sm font-medium text-on-background shadow-sm hover:bg-on-background-decoration focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            id={`${id}-menu-button`}
            aria-expanded={open ? 'true' : 'false'}
            aria-haspopup="true"
            onClick={toggleMenu}
          >
            {label}
            <Icon name="chevron-down" />
          </button>
        ) : (
          <button
            ref={buttonElementRef}
            type="button"
            className={clsx(
              palette === 'information'
                ? 'bg-information fill-primary hover:fill-primary-hover focus:ring-primary focus:ring-offset-information'
                : 'bg-background fill-on-background hover:fill-primary focus:ring-primary focus:ring-offset-background',
              'flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2'
            )}
            id={`${id}-menu-button`}
            aria-expanded={open ? 'true' : 'false'}
            aria-haspopup="true"
            onClick={toggleMenu}
          >
            <span className="sr-only">Open options</span>
            <Icon name="solid-ellipsis-vertical-black" />
          </button>
        )}
      </div>
      {withPortal ? createPortal(renderedDropdown, document.body) : renderedDropdown}
    </div>
  );
}
