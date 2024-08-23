import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { clsx } from 'clsx';
import { PaginationParams } from 'sync/request.types';
import { CoreAgGridProps, DataGridMode, DataGridPagination, DataGridSortModel } from './data-grid.types';
import { attachExtraColumnProperties, getDataGridSortHandler, getIconDefinitions } from './data-grid.utils';
import { QuickFilter } from './filter/quick-filter';
import { Pagination } from './pagination';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css';

export type DataGridProps<TData> = Omit<
  CoreAgGridProps<TData>,
  'onSortChanged' | 'onPaginationChanged' | 'paginationPageSize' | 'pagination'
> & {
  rowData?: TData[] | null;
  expandableColId?: string;
  expandOnRowClick?: boolean;
  mode: DataGridMode;
  onSortChange?: (sortModel: DataGridSortModel) => void;
  quickFilter?: boolean;
  quickFilterPlaceholder?: string;
  isWithUpperTotalCount?: boolean;
  pagination?: DataGridPagination;
  customPagination?: PaginationParams;
  slim?: boolean;
  dataAutoId?: string;
  containerClassName?: string;
  autoSizeColumns?: boolean;
};

export function DataGrid<T>({
  domLayout = 'autoHeight',
  columnDefs,
  mode,
  onSortChange = () => { },
  quickFilterPlaceholder,
  isWithUpperTotalCount = false,
  pagination,
  customPagination,
  slim = false,
  containerClassName,
  expandOnRowClick = true,
  dataAutoId,
  defaultColDef,
  autoSizeColumns = false,
  rowData,
  ...props
}: DataGridProps<T>) {
  const memoRowData = useMemo(() => rowData, [rowData]);
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

  useEffect(() => {
    if (gridRef?.current?.api && customPagination?.page) {
      gridRef.current.api.paginationGoToPage(customPagination.page - 1);
    }
  }, [customPagination?.page, gridRef]);

  const changeQuickFilter = (value: string) => {
    gridRef.current?.api?.setQuickFilter(value);
  };


  const autoSizeAll = useCallback(() => {
    if (memoRowData && memoRowData.length > 0 && gridRef.current && gridRef.current.api) {
      gridRef.current.columnApi.autoSizeAllColumns();
    }
  }, [memoRowData]);

  const onGridReady = useCallback(() => {
    if (!autoSizeColumns) {
      return;
    }
    autoSizeAll();
  }, [autoSizeAll, autoSizeColumns]);

  useEffect(() => {
    if (!autoSizeColumns) {
      return () => { };
    }

    const animationFrameID = requestAnimationFrame(() => {
      if (gridRef.current && gridRef.current.api) {
        gridRef.current.api.sizeColumnsToFit();
      }
    });
    if (memoRowData && memoRowData.length > 0) {
      setTimeout(() => {
        autoSizeAll();
      }, 0);
    }

    return () => {
      cancelAnimationFrame(animationFrameID);
    };
  }, [autoSizeAll, autoSizeColumns, memoRowData]);

  return (
    <div
      data-auto-id={`${dataAutoId}-simple-grid-row`}
      className={clsx(
        'data-grid ag-theme-alpine h-full w-full overflow-hidden',
        `data-grid--${mode}`,
        slim && 'data-grid--slim',
        containerClassName,
        props.masterDetail && expandOnRowClick && 'data-grid--expandable'
      )}
    >
      {props.quickFilter && <QuickFilter placeholder={quickFilterPlaceholder} changeQuickFilter={changeQuickFilter} />}
      {isWithUpperTotalCount && (
        <p className="border border-on-background-decoration py-3 px-4 font-medium">Total {(memoRowData || []).length}</p>
      )}
      <AgGridReact<T>
        ref={gridRef}
        suppressPaginationPanel
        onSortChanged={sortHandler}
        rowHeight={64}
        onGridReady={onGridReady}
        defaultColDef={{
          autoHeight: true,
          flex: autoSizeColumns ? undefined : 1,
          cellClass: 'py-3 table-cell break-words align-middle text-base',
          sortable: false,
          resizable: false,
          ...defaultColDef,
        }}
        columnDefs={extendedColumnDefs}
        domLayout={domLayout}
        icons={iconDefinitions}
        suppressContextMenu
        suppressMovableColumns
        suppressRowDrag
        animateRows
        rowData={memoRowData}
        pagination={!!customPagination}
        paginationPageSize={customPagination?.perPage}
        {...props}
      />
      {pagination && (
        <Pagination
          page={pagination.page}
          perPage={pagination.perPage}
          totalItems={pagination.totalItems}
          displayedItems={memoRowData?.length || 0}
          changePage={pagination.onPaginationChanged}
        />
      )}
    </div>
  );
}