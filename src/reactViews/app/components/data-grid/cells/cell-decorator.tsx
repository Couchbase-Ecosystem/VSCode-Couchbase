import { DataGrid } from 'components/data-grid/data-grid';

export function CellDecorator({ children }: { children: React.ReactNode }) {
  return (
    <DataGrid
      onSortChange={() => {}}
      mode="dark"
      rowData={[
        {
          column: '',
        },
      ]}
      columnDefs={[
        {
          field: 'firstColumn',
          headerName: 'First Column',
          cellRenderer: () => children,
          flex: 1,
        },
        {
          flex: 1,
          field: 'secondColumn',
          headerName: 'Second Column',
          cellRenderer: () => children,
        },
      ]}
    />
  );
}
