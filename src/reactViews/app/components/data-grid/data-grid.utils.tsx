import { renderToString } from 'react-dom/server';
import { ColDef, GridSizeChangedEvent } from 'ag-grid-community';
import { clsx } from 'clsx';
import { Icon } from 'components/icon';
import { CoreAgGridProps, DataGridMode, DataGridSortModel } from './data-grid.types';

export const getIconDefinitions = (mode: DataGridMode) => {
  const sortIcon = <Icon size="xsmall" name="sort" className={mode === 'dark' ? 'fill-background' : 'fill-on-background'} />;

  return Object.fromEntries(
    Object.entries({
      sortAscending: <div className="flex">{sortIcon}</div>,
      sortDescending: <div className="rotate-180 flex">{sortIcon}</div>,
      sortUnSort: (
        <div className="flex flex-col">
          {sortIcon}
          <div className="rotate-180 flex">{sortIcon}</div>
        </div>
      ),
    }).map(([key, node]) => {
      // AG Grid requires icon definitions to be pure HTML and does not render anything when ReactNode is passed.
      // As it's only static content, it has been sorted out with renderToString method to produce proper HTML.

      return [key, renderToString(node)];
    })
  );
};

export const HEADER_CLASSNAME = 'font-primary text-sm font-medium uppercase leading-none';

export function attachExtraColumnProperties<T>(columnDefs: CoreAgGridProps<T>['columnDefs']) {
  if (!columnDefs) {
    return columnDefs;
  }

  return columnDefs?.map((item) => {
    let unSortIcon = false;

    if ('unSortIcon' in item) {
      unSortIcon = !!item.unSortIcon;
    } else {
      unSortIcon = 'sortable' in item && !!item.sortable;
    }

    return {
      ...item,
      headerClass: clsx(HEADER_CLASSNAME, item.headerClass),
      unSortIcon,
    };
  });
}

export function getDataGridSortHandler<T>({
  onSortChange,
  resetPagination,
}: {
  onSortChange?: (model: DataGridSortModel) => void;
  resetPagination: () => void;
}): NonNullable<CoreAgGridProps<T>['onSortChanged']> {
  return (event) => {
    if (!onSortChange) {
      return;
    }

    const currentColumnDefs = event.api.getColumnDefs();
    const foundElement = currentColumnDefs?.find((item) => 'sort' in item && item.sort) as ColDef<T> | undefined;

    if (foundElement) {
      onSortChange({
        field: foundElement.field!,
        order: foundElement.sort!,
      });
    } else {
      onSortChange({
        field: null,
        order: null,
      });
    }

    resetPagination();
  };
}

export const DESKTOP_BREAKPOINT = 1200;

export function dataGridResizeHandler<T>(event: GridSizeChangedEvent<T>) {
  if (event.clientWidth > DESKTOP_BREAKPOINT) {
    event.api.sizeColumnsToFit();
  }
}
