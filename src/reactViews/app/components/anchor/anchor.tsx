import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { Icon, IconName } from 'components/icon';
import { Emphasis, TextSize } from './anchor.types';

export type AnchorProps = {
  href: string;
  disabled?: boolean;
  emphasis?: Emphasis;
  iconLeft?: IconName;
  iconRight?: IconName;
  openInNewTab?: boolean;
  openInNewTabIcon?: boolean;
  textSize?: TextSize;
  fontWeight?: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

const getEmphasisClass = (emphasis: Emphasis, isDisabled: boolean) => {
  switch (emphasis) {
    case 'primary-button':
      return isDisabled
        ? 'button bg-inactive text-on-inactive border-inactive cursor-default pointer-events-none'
        : 'button button--primary';

    case 'secondary-table-button':
      return 'button button--primary-inverse button--table';

    case 'secondary-button':
      return isDisabled ? 'button text-background-alternate cursor-default pointer-events-none' : 'button button--primary-inverse';

    case 'base':
      return isDisabled ? 'text-background-alternate cursor-default pointer-events-none' : 'text-background-alternate';
    default:
      return isDisabled
        ? 'text-background-alternate cursor-default pointer-events-none'
        : 'text-on-background-link hover:text-on-background-link-hover hover:underline active:text-on-background-link-active focus:text-on-background-link-hover';
  }
};

const displayByEmphasis: { [P in Emphasis]: string } = {
  'primary-button': 'inline-block',
  'secondary-button': 'inline-block',
  'secondary-table-button': 'inline-block',
  base: 'inline',
  default: 'inline',
  danger: '',
};

export function Anchor({
  href,
  disabled = false,
  emphasis = 'default',
  iconLeft,
  iconRight,
  openInNewTab = false,
  openInNewTabIcon = true,
  textSize = 'default',
  fontWeight = 'font-medium',
  children,
  onClick,
  className,
}: AnchorProps) {
  return openInNewTab ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        displayByEmphasis[emphasis],
        getEmphasisClass(emphasis, disabled),
        textSize === 'small' ? 'text-sm' : `text-base ${fontWeight}`,
        'inline-flex items-baseline',
        className
      )}
      onClick={onClick}
    >
      {emphasis === 'primary-button' || emphasis === 'secondary-button' ? (
        <span className="button__text">{children}</span>
      ) : (
        <span className={clsx('inline-flex items-baseline', textSize === 'small' ? 'text-sm' : 'text-base font-medium')}>{children}</span>
      )}
      <span className="sr-only">Opens in a new tab.</span>
      {openInNewTabIcon && (
        <span className={clsx('ml-0.5 flex pt-1', disabled ? 'fill-on-background-alternate' : 'fill-on-background-link')}>
          <Icon size="small" name="arrow-up-right-from-square" />
        </span>
      )}
    </a>
  ) : (
    <Link
      className={clsx(
        getEmphasisClass(emphasis, disabled),
        displayByEmphasis[emphasis],
        iconLeft && 'button--icon-left',
        iconRight && 'button--icon-right',
        className
      )}
      to={href}
      onClick={onClick}
    >
      {iconLeft && (
        <span className="button__icon">
          <Icon name={iconLeft} />
        </span>
      )}
      {emphasis === 'primary-button' || emphasis === 'secondary-button' || emphasis === 'secondary-table-button' ? (
        <span className="button__text">{children}</span>
      ) : (
        <span className={clsx(textSize === 'small' ? 'text-sm' : `text-base ${fontWeight}`)}>{children}</span>
      )}
      {iconRight && (
        <span className="button__icon">
          <Icon name={iconRight} />
        </span>
      )}
    </Link>
  );
}
