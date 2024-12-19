import { clsx } from 'clsx';
import { CtaProps, Variant } from 'components/cta';
import { Icon, IconName, IconSize } from 'components/icon';
import { Tooltip } from 'components/tooltip';

type IconCtaCellProps = {
  icon: IconName;
  size: IconSize;
  cta: CtaProps;
  disabled?: boolean;
  variant?: Variant;
  tooltip?: string;
};

const variantClass = (variant: Variant) => {
  switch (variant) {
    case 'danger':
      return 'hover:fill-danger-hover hover:text-danger-hover';
    default:
      return '';
  }
};

export function IconCtaCell({ icon, disabled = false, cta, tooltip, variant = 'primary', size = 'default' }: IconCtaCellProps) {
  return (
    <div className="inline-block align-middle">
      {tooltip ? (
        <Tooltip
          renderContent={() => (
            <button
              type="button"
              className={clsx(disabled && 'fill-notice', variant, variantClass(variant))}
              disabled={disabled}
              onClick={cta.onClick}
            >
              {tooltip}
            </button>
          )}
        >
          <Icon size={size} name={icon} className={clsx(variant)} />
        </Tooltip>
      ) : (
        <button
          type="button"
          className={clsx(disabled && 'fill-notice', 'mr-4', variant, variantClass(variant))}
          disabled={disabled}
          onClick={cta.onClick}
        >
          <Icon size={size} name={icon} className={clsx(variant)} />
        </button>
      )}
    </div>
  );
}
