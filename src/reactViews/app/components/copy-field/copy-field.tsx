import { clsx } from 'clsx';
import { Button } from 'components/button';
import { Icon, IconName, IconSize } from 'components/icon';
import { Tooltip } from 'components/tooltip';
import { useCopy } from 'hooks/use-copy';
import { maskString } from 'utils/strings';
import { COPY_DELAY_IN_MS } from './copy-field.constants';

export type CopyFieldProps = {
  icon?: IconName;
  iconSize?: IconSize;
  label?: string;
  value: string;
  secret?: boolean;
  copyText?: string;
  copiedText?: string;
  slim?: boolean;
};

export function CopyField({
  label,
  icon,
  iconSize = 'small',
  value,
  secret = false,
  copyText = 'Copy',
  copiedText = 'Copied',
  slim,
}: CopyFieldProps) {
  const valueToDisplay = secret ? maskString(value) : value;
  const { copied, handleCopy } = useCopy(COPY_DELAY_IN_MS);

  const copy = () => {
    handleCopy(value);
  };

  return (
    <Tooltip
      key={value}
      className="overflow-hidden"
      renderContent={() => <span className="whitespace-nowrap text-sm">{copied ? copiedText : copyText}</span>}
      placement="top"
      withPortal
    >
      <div className={clsx('flex', !slim && 'min-h-[3.875rem]')}>
        <div
          className={clsx(
            'grow border-y border-l border-on-background-decoration bg-surface px-3 overflow-hidden',
            !slim && 'py-2',
            slim && 'py-3.5'
          )}
        >
          <div className="flex flex-col">
            {(label || icon) && !slim && (
              <div className="mb-1 flex fill-on-background-alternate">
                {icon && <Icon name={icon} size={iconSize} />}
                <span className={clsx(icon && 'ml-1', 'text-xs font-medium text-on-surface-alternate')}>{label}</span>
              </div>
            )}
            <div className={clsx('flex w-60 sm:w-full', !label && !slim && 'mt-4')}>
              <button
                type="button"
                className="w-full text-left text-base leading-normal text-on-surface hover:text-on-background-link-hover overflow-hidden whitespace-nowrap text-ellipsis"
                onClick={copy}
                disabled={!value}
              >
                {valueToDisplay}
              </button>
            </div>
          </div>
        </div>
        <div
          className={clsx(
            'max-w-[42px] md:min-w-[42px] bg-white flex w-2/24 items-center justify-center border-y border-r border-on-background-decoration',
            slim && 'bg-surface'
          )}
        >
          <Button
            className={clsx(slim && 'bg-surface')}
            iconOnly
            label={label ? `Copy ${label}` : 'Copy'}
            icon="copy"
            iconClassName="fill-on-surface-decoration"
            onClick={copy}
            disabled={!value}
          />
        </div>
      </div>
    </Tooltip>
  );
}
