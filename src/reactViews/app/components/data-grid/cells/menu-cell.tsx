import { Menu } from 'components/menu';
import { MenuItem } from 'components/menu/menu.types';

type MenuCellProps = {
  menuItems: MenuItem[];
};

export function MenuCell({ menuItems }: MenuCellProps) {
  return (
    <div className="mx-2">
      <Menu withPortal placement="bottom-end" offset={[4, 8]} items={menuItems} />
    </div>
  );
}
