import { clsx } from 'clsx';
import { Icon, IconName } from 'components/icon';
import { ChipType, Status } from './chip.types';

export type ChipProps = {
  onClose?: () => void;
  iconLeft?: IconName;
  altTextClose?: string;
  status?: Status;
  chipType?: ChipType;
  children?: React.ReactNode;
};

export function Chip({ onClose, iconLeft, altTextClose = 'close', status = 'notice', chipType = 'info', children }: ChipProps) {
  const statusBackground: { [P in Status]: string } = {
    error: 'bg-error text-on-error',
    warning: 'bg-warning text-on-warning',
    success: 'bg-success text-on-success',
    info: 'bg-information text-on-info',
    notice: 'bg-notice text-on-notice',
  };

  const chipStyles: { [P in ChipType]: string } = {
    input: 'cursor-pointer hover:drop-shadow pr-1',
    info: 'cursor-default',
    status: 'cursor-default uppercase',
  };

  return (
    <div
      role="button"
      tabIndex={onClose && -1}
      className={clsx(
        'inline-flex items-center rounded-full border border-transparent py-1 px-2.5 text-sm',
        statusBackground[status],
        chipStyles[chipType],
        {
          'focus:border-on-information-decoration': onClose,
        }
      )}
    >
      {iconLeft && (
        <span className="remove-text-node pr-1">
          <Icon name={iconLeft} size="small" />
        </span>
      )}
      <span className="inline-block break-all text-sm leading-none">{children}</span>
      {chipType === 'input' && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (onClose) {
              onClose();
            }
          }}
          className="relative ml-0.5 inline-flex h-4 w-6 flex-shrink-0 items-center justify-center rounded-full fill-on-surface hover:fill-on-surface-link"
        >
          <span className="sr-only">{altTextClose}</span>
          <Icon name="solid-xmark" size="small" />
        </button>
      )}
    </div>
  );
}
