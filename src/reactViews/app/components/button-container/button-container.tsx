import { ComponentProps } from 'react';
import { clsx } from 'clsx';
import { ButtonContainerGapSize } from './button-container.types';

type ButtonContainerProps = ComponentProps<'div'> & {
  gap?: ButtonContainerGapSize;
  bottom?: boolean;
};

export function ButtonContainer({ gap = 'default', bottom = true, className, ...props }: ButtonContainerProps) {
  return (
    <div
      className={clsx(
        bottom && gap === 'default' && 'my-6 md:my-8',
        bottom && gap !== 'default' && 'my-gutter',
        !bottom && gap === 'default' && 'mt-6 md:mt-8',
        !bottom && gap !== 'default' && 'mt-gutter',
        className
      )}
      {...props}
    />
  );
}
