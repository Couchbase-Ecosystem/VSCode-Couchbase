import { IconName } from 'components/icon';

export type AnchorItem = {
  label: string;
  icon?: IconName;
  group?: string;
  href: string;
  disabled?: boolean;
  tooltip?: string;
  hide?: boolean;
};

export type ButtonItem = {
  label: string;
  icon?: IconName;
  group?: string;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
  hide?: boolean;
};
export type MenuItem = AnchorItem | ButtonItem;

export type Menu = {
  items: MenuItem[];
};

export type Palette = 'default' | 'information';
