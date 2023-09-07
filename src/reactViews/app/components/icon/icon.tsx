import { clsx } from 'clsx';
// import makeDataAutoId from 'utils/make-data-auto-id';
import { IconName, IconSize, IconStyle } from './icon.types';
import plus from '../../assets/icons/plus.svg';
import minus from '../../assets/icons/minus.svg';
import downChevron from '../../assets/icons/chevron-down.svg';
import upChevron from '../../assets/icons/chevron-up.svg';
import leftChevron from '../../assets/icons/chevron-left.svg';
import rightChevron from '../../assets/icons/chevron-right.svg';
import sort from '../../assets/icons/sort.svg';

interface IconProps {
  title?: string;
  name: IconName;
  style?: IconStyle;
  className?: string;
  size?: IconSize;
  dataAutoId?: string;
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

export function Icon({ title, name, size = 'default', style = 'default', className, dataAutoId }: IconProps) {
    // Create a mapping of icon names to their import paths
    const iconMap = {
      'plus': plus,
      'minus': minus,
      'down-chevron': downChevron,
      'up-chevron': upChevron,
      'left-chevron': leftChevron,
      'right-chevron': rightChevron,
      'sort': sort
    };
  
    // Get the icon path based on the 'name' prop
    const iconPath = iconMap[name];
    // const maybeDataAutoId = makeDataAutoId(dataAutoId, 'icon');
  
    if (!iconPath) {
      // Handle the case where an invalid icon name is provided
      console.warn(`Invalid icon name: ${name}`);
      return null; // or return a default icon
    }
  return (
    <img src= {iconPath} className={clsx(sizeClass[size], className, 'fill-inherit text-inherit', style === 'default' && 'inline-block align-middle')} aria-hidden="true" />
  );
}
