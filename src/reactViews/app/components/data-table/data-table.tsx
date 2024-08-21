import { useMemo } from 'react';
import { ICellRendererParams as CellRendererParams } from 'ag-grid-community';
import { clsx } from 'clsx';
import { DataGrid } from 'components/data-grid';
import { ArrayCell } from 'components/data-table/array-cell';
import { getHeadersStructureAndWidths } from 'components/data-table/data-table.utils';
import { uniqueId } from 'utils/unique-id/unique-id';
import './data-table.scss';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import { ROW_ID_FIELD } from './data-table.types';

type DataTableProps = {
  data?: Record<string, unknown>[];
  dataFallback: Record<string, unknown>[];
};

interface Schema {
  [key: string]: any;
}

const safelyAccessProperty = (obj: any, path: string): string => {
  return path.split('.').reduce((acc, part) => {
    return acc && acc[part] !== undefined ? acc[part] : '';
  }, obj);
};

export function DataTable({ data, dataFallback }: DataTableProps) {
  const queryResult = (data || dataFallback).map((result) => {
    const resultValue = Object.values(result)[0];
    return typeof resultValue === 'object' && !!resultValue ? resultValue : result;
  });

  const { arrayInnerObjects } = useMemo(() => getHeadersStructureAndWidths(queryResult), [queryResult]);
  const headers = arrayInnerObjects!.innerKeys;

  const cellRenderer = ({ value: cellValue, node: { rowIndex }, colDef }: CellRendererParams<unknown>) => {
    const columnName = colDef!.field!;
    const { type, arrayInnerObjects } = headers[columnName];
    const cellTitle = data ? `results[${rowIndex}].${Object.keys(data[0])[0]}.${columnName}` : '';
    const isArray = Array.isArray(cellValue);
    let valueToRender: React.ReactNode;

    if (isArray) {
      if (!cellValue.length) {
        valueToRender = '[]';
      } else if (arrayInnerObjects) {
        valueToRender = (
          <table className="w-full" key={uniqueId()}>
            {cellValue.map(
              (value, index) =>
                value && (
                  <ArrayCell
                    headers={arrayInnerObjects}
                    key={uniqueId()}
                    first={index === 0}
                    value={value}
                    cellTitle={`${cellTitle}[${index}]`}
                  />
                )
            )}
          </table>
        );
      } else {
        valueToRender = (
          <ul>
            {cellValue.map((value, index) => {
              let content;
              if (Array.isArray(value)) {
                content = (
                  <ul>
                    {value.map((innerValue) => (
                      <li key={innerValue}>{innerValue === null ? 'null' : innerValue}</li>
                    ))}
                  </ul>
                );
              } else if (value === null) {
                content = 'null';
              } else {
                content = String(value);
              }

              return (
                <li title={`${cellTitle}[${index}]`} key={value}>
                  {content}
                </li>
              );
            })}
          </ul>
        );
      }
    }

    if (type.isObject && !!cellValue) {
      valueToRender = (
        <table className="w-full">
          <ArrayCell headers={headers[columnName]} first value={cellValue} cellTitle={cellTitle} />
        </table>
      );
    }

    return (
      <span className={clsx(cellValue === null && 'italic')} title={cellTitle}>
        {valueToRender || String(cellValue)}
      </span>
    );
  };
  const wrapColumnDefs = (columnDefs: ColDef[]): ColDef[] => {
    return columnDefs.map((colDef) => ({
      ...colDef,
      valueGetter: (params: ValueGetterParams) => {
        if (colDef.field) {
          return safelyAccessProperty(params.data, colDef.field);
        }
        if (colDef.valueGetter) {
          if (typeof colDef.valueGetter === 'function') {
            return colDef.valueGetter(params);
          }
          return colDef.valueGetter;
        }
        return '';
      },
    }));
  };
  const getColumnsDefinitions = (objectSchemas: Schema[]): ColDef[] => {
    // Combine all schemas into one
    const combinedSchema: Schema = objectSchemas.reduce((acc: Schema, schema: Schema) => {
      Object.keys(schema).forEach((key) => {
        if (!acc[key]) {
          acc[key] = schema[key];
        }
      });
      return acc;
    }, {});

    // Generate column definitions from the combined schema
    const rawColumnDefs: ColDef[] = Object.keys(combinedSchema)
      .filter((key) => key !== ROW_ID_FIELD)
      .sort()
      .map(
        (key): ColDef => ({
          valueFormatter: (params) => params.data[key],
          field: key,
          headerName: key,
          cellRendererParams: { headers, identifiedData: data },
          cellRenderer: cellRenderer,
          headerClass: clsx('normal-case bg-gray-500 p-0 pl-1 text-xs font-normal text-[#555] bg-[#eceff2] data-table-header'),
          cellClass: clsx('p-0 pl-1 justify-start mt-[-1px] text-xs !justify-start', headers[key]?.type.isString && 'max-w-[80ch]'),
        })
      );

    return wrapColumnDefs(rawColumnDefs);
  };

  return (
    <DataGrid
      getRowId={({ data }) => data[ROW_ID_FIELD]}
      enableCellTextSelection
      containerStyle={{
        '--ag-header-column-separator-display': 'block',
        '--ag-header-column-separator-height': '100%',
        '--ag-header-column-separator-width': '1px',
        '--ag-header-column-separator-color': '#d1d1d1',
      }}
      domLayout="normal"
      rowBuffer={20}
      headerHeight={19}
      rowHeight={15}
      rowClass="border-b odd:bg-[#f6fafd]"
      mode="light"
      rowData={queryResult}
      columnDefs={getColumnsDefinitions(queryResult)}
      onFirstDataRendered={({ columnApi }) => columnApi.autoSizeAllColumns()}
      onGridSizeChanged={undefined}
    />
  );
}
