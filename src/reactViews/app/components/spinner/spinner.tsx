import { clsx } from 'clsx';
import { SpinnerSize } from './spinner.types';
import styles from './spinner.module.scss';

type SpinnerProps = {
  size?: SpinnerSize;
  centered?: boolean;
};

const sizeClass: { [P in SpinnerSize]: string } = {
  select: 'w-4 h-4',
  button: 'w-6 h-6',
  small: 'w-12 h-12',
  large: 'w-20 h-20',
  default: 'w-16 h-16',
};

export function Spinner({ size = 'default', centered = false }: SpinnerProps) {
  const spinnerContainerClassName = clsx(styles.spinner, 'relative z-1', sizeClass[size], centered && 'mx-auto my-16');
  const spinnerSvgClassName = clsx('absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', sizeClass[size]);

  return (
    <div className={spinnerContainerClassName}>
      <svg className={spinnerSvgClassName} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38">
        <circle className={styles['spinner-outer-circle']} cx="19" cy="19" r="15" />
        <circle className={styles['spinner-inner-circle']} cx="19" cy="19" r="15" />
      </svg>
    </div>
  );
}
