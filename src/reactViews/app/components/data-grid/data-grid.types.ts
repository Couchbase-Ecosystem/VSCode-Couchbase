import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { PaginationSize } from './pagination/pagination.utils';

export type DataGridMode = 'light' | 'dark';
export type CoreAgGridProps<TData> = AgGridReactProps<TData> | AgReactUiProps<TData>;

export type DataGridSortModel =
  | {
      field: string;
      order: 'asc' | 'desc';
    }
  | {
      field: null;
      order: null;
    };

export type CellRenderer<T, V = string> = (props: { data: T; value: V }) => React.ReactNode;

export type DataGridPagination = {
  onPaginationChanged: (page: number, perPage: PaginationSize) => void;
  totalItems: number;
  page: number;
  perPage: PaginationSize;
};
