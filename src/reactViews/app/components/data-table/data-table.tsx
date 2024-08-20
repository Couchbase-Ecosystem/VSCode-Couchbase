import { useMemo } from 'react';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import { clsx } from 'clsx';
import { DataGrid } from 'components/data-grid';
import { getHeadersStructureAndWidths } from 'components/data-table/data-table.utils';
import makeDataAutoId from 'utils/make-data-auto-id';
import {  ROW_ID_FIELD } from './data-table.types';
import { DataTableCellRenderer } from './data-table-renderer';
import './data-table.scss';

type DataTableProps = {
  data?: Record<string, unknown>[];
  dataFallback: Record<string, unknown>[];
  dataAutoId?: string;
};

interface Schema {
  [key: string]: any;
}

const safelyAccessProperty = (obj: any, path: string): string => {
  return path.split('.').reduce((acc, part) => {
    return acc && acc[part] !== undefined ? acc[part] : '';
  }, obj);
};

export function DataTable({ data, dataFallback, dataAutoId }: DataTableProps) {
  const maybeDataAutoId = makeDataAutoId(dataAutoId, 'data-table');
  const queryResult = (data || dataFallback).map((result) => {
    const resultKeys = Object.keys(result);
    if (resultKeys.length > 2) {
      return result;
    }
    const resultEntry = Object.entries(result).filter(([key]) => key !== ROW_ID_FIELD)[0];
    const resultValue = resultEntry ? resultEntry[1] : '';
    return typeof resultValue === 'object' && !Array.isArray(resultValue) && resultValue !== null ? resultValue : result;
  });

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

  const { arrayInnerObjects } = useMemo(() => getHeadersStructureAndWidths(queryResult), [queryResult]);
  const headers = arrayInnerObjects?.innerKeys ?? {};

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
          cellRenderer: DataTableCellRenderer,
          headerClass: clsx('normal-case bg-gray-500 p-0 pl-1 text-xs font-normal text-[#555] bg-[#eceff2] data-table-header'),
          cellClass: clsx('p-0 pl-1 justify-start mt-[-1px] text-xs !justify-start', headers[key]?.type.isString && 'max-w-[80ch]'),
        })
      );

    return wrapColumnDefs(rawColumnDefs);
  };

  try {
    return (
      <div data-auto-id={maybeDataAutoId()} className="h-full">
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
        />
      </div>
    );
  } catch {
    return <div>Unable to render data as table. Please use JSON view instead.</div>;
  }
}
