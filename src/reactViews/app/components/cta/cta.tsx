import { Anchor } from 'components/anchor';
import { Button } from 'components/button';
import type { Variant } from 'components/cta/cta.types';

export type CtaProps = {
  disabled?: boolean;
  variant?: Variant;
  label: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const buttonVariant = {
  primary: 'primary',
  'primary-inverse': 'secondary',
  'danger-secondary': 'danger-secondary',
  danger: 'danger',
} as const;

const anchorEmphasis = {
  primary: 'primary-button',
  'primary-inverse': 'secondary-button',
  'danger-secondary': 'secondary-button',
  danger: 'danger',
} as const;

export function Cta({ disabled = false, variant = 'primary-inverse', href, onClick, label }: CtaProps) {
  if (href) {
    return (
      <Anchor href={href} emphasis={anchorEmphasis[variant]} disabled={disabled}>
        {label}
      </Anchor>
    );
  }

  return (
    <Button
      variant={buttonVariant[variant]}
      onClick={(event) => {
        event.stopPropagation();

        if (onClick) {
          onClick(event);
        }
      }}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
