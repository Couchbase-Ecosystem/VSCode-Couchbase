import { clsx } from 'clsx';
import { Icon, IconName } from 'components/icon';
import { Emphasis, Status } from 'components/status-icon/status-icon.types';
import { Tooltip } from 'components/tooltip';

const statusIconColor = {
  pending: 'fill-primary',
  loading: 'fill-primary',
  active: 'fill-primary',
  warning: 'fill-on-warning-decoration',
  error: 'fill-on-error-decoration',
  success: 'fill-on-success-decoration',
  default: 'fill-notice',
};

const statusIcon = {
  primary: {
    pending: 'solid-circle-ellipsis',
    loading: 'duotone-spinner-third',
    error: 'solid-circle-xmark',
    success: 'solid-circle-check',
    warning: 'solid-circle-exclamation',
    active: 'solid-circle',
    default: 'solid-circle',
  },
  secondary: {
    loading: 'duotone-spinner-third',
    error: 'solid-circle',
    pending: 'solid-circle',
    success: 'solid-circle',
    warning: 'solid-circle',
    active: 'solid-circle',
    default: 'solid-circle',
  },
};

type StatusIconProps = {
  emphasis?: Emphasis;
  label?: string;
  status?: Status;
  size?: 'default' | 'small';
  tooltipMessage?: string;
  className?: string;
};

export function StatusIcon({
  label,
  tooltipMessage,
  size = 'default',
  emphasis = 'primary',
  status = 'default',
  className,
}: StatusIconProps) {
  const iconComponent = (
    <Icon
      name={statusIcon[emphasis][status] as IconName}
      size={size}
      className={clsx({ 'animate-spin text-on-background-link': status === 'loading' })}
    />
  );

  return (
    <div className={clsx('remove-text-node', statusIconColor[status], className)}>
      {label && <span className="sr-only">{label}</span>}

      {tooltipMessage ? (
        <Tooltip className="w-fit" renderContent={() => <span className="whitespace-nowrap text-sm">{tooltipMessage}</span>}>
          {iconComponent}
        </Tooltip>
      ) : (
        iconComponent
      )}
    </div>
  );
}
