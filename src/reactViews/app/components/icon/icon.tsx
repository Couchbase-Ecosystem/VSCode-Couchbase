import { clsx } from 'clsx';
import { IconName, IconSize, IconStyle } from './icon.types';

interface IconProps {
  title?: string;
  name: IconName;
  style?: IconStyle;
  className?: string;
  size?: IconSize;
}

const sizeClass: { [P in IconSize]: string } = {
  xsmall: 'w-2 h-2',
  small: 'w-3 h-3',
  large: 'w-5 h-5',
  xlarge: 'w-6 h-6',
  xxlarge: 'w-8 h-8',
  xxxlarge: 'w-10 h-10',
  xxxxlarge: 'w-[8rem] h-[8rem]',
  xxxxxlarge: 'w-11 h-12',
  'column-header': 'w-14 h-11',
  'logo-ping': 'h-9 w-24',
  'logo-azure': 'h-6 w-36',
  'logo-cyberark': 'h-9 w-24',
  'big-cloud-dropzone': 'h-44 w-48',
  default: 'w-4 h-4',
};

export function Icon({ title, name, size = 'default', style = 'default', className }: IconProps) {
  const symbolId = `#icon-${name}`;

  return (
    <svg
      className={clsx(sizeClass[size], className, 'fill-inherit text-inherit', style === 'default' && 'inline-block align-middle')}
      aria-hidden="true"
    >
      {title && <title>{title}</title>}
      <use href={symbolId} />
    </svg>
  );
}
