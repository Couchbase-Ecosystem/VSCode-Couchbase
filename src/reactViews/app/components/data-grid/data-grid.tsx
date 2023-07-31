import { useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { clsx } from 'clsx';
import { CoreAgGridProps, DataGridMode, DataGridPagination, DataGridSortModel } from './data-grid.types';
import { attachExtraColumnProperties, dataGridResizeHandler, getDataGridSortHandler, getIconDefinitions } from './data-grid.utils';
import { QuickFilter } from './filter/quick-filter';
import { Pagination } from './pagination';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css';

export type DataGridProps<TData> = Omit<
  CoreAgGridProps<TData>,
  'onSortChanged' | 'onPaginationChanged' | 'paginationPageSize' | 'pagination'
> & {
  mode: DataGridMode;
  onSortChange?: (sortModel: DataGridSortModel) => void;
  quickFilter?: boolean;
  quickFilterPlaceholder?: string;
  isWithUpperTotalCount?: boolean;
  pagination?: DataGridPagination;
};

export function DataGrid<T>({
  domLayout = 'autoHeight',
  columnDefs,
  mode,
  onSortChange = () => {},
  quickFilterPlaceholder,
  isWithUpperTotalCount = false,
  pagination,
  ...props
}: DataGridProps<T>) {
  const [loaded, setLoaded] = useState(false);
  const extendedColumnDefs = useMemo(() => attachExtraColumnProperties(columnDefs), [columnDefs]);
  const iconDefinitions = useMemo(() => getIconDefinitions(mode), [mode]);
  const sortHandler = useMemo(
    () =>
      getDataGridSortHandler<T>({
        onSortChange,
        resetPagination: () => {
          if (pagination?.onPaginationChanged) {
            pagination.onPaginationChanged!(1, pagination?.perPage);
          }
        },
      }),
    [onSortChange, pagination?.onPaginationChanged, pagination?.perPage]
  );
  const gridRef = useRef<AgGridReact<T>>(null);

  const changeQuickFilter = (value: string) => {
    gridRef.current?.api?.setQuickFilter(value);
  };

  return (
    <div className={clsx('data-grid ag-theme-alpine h-full w-full overflow-hidden', `data-grid--${mode}`)}>
      {props.quickFilter && <QuickFilter placeholder={quickFilterPlaceholder} changeQuickFilter={changeQuickFilter} />}
      {isWithUpperTotalCount && (
        <p className="border border-on-background-decoration py-3 px-4 font-medium">Total {(props.rowData || []).length}</p>
      )}
      <AgGridReact<T>
        ref={gridRef}
        suppressPaginationPanel
        onSortChanged={sortHandler}
        defaultColDef={{
          autoHeight: true,
          cellClass: 'py-3 table-cell break-words align-middle text-base',
          ...props.defaultColDef,
        }}
        columnDefs={extendedColumnDefs}
        onGridSizeChanged={dataGridResizeHandler}
        domLayout={domLayout}
        icons={iconDefinitions}
        {...props}
        onGridReady={(event) => {
          setLoaded(true);

          if (props.onGridReady) {
            props.onGridReady(event);
          }
        }}
        rowClass={clsx(!loaded && 'invisible')}
      />
      {pagination && (
        <Pagination
          page={pagination.page}
          perPage={pagination.perPage}
          totalItems={pagination.totalItems}
          displayedItems={props.rowData?.length || 0}
          changePage={pagination.onPaginationChanged}
        />
      )}
    </div>
  );
}
