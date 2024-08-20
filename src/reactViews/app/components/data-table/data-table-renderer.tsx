import { ICellRendererParams as CellRendererParams } from 'ag-grid-community';
import { clsx } from 'clsx';
import { ArrayCell } from './array-cell';
import { HeadersData, IdentifiedData, ROW_ID_FIELD } from './data-table.types';

interface CellRendererProps extends CellRendererParams<unknown> {
  identifiedData?: IdentifiedData[];
  headers: Record<string, HeadersData>;
}

export function DataTableCellRenderer({ value: cellValue, node: { rowIndex }, colDef, headers, identifiedData: data }: CellRendererProps) {
  const columnName = colDef!.field!;
  const { type, arrayInnerObjects } = headers[columnName];
  const cellTitle = data ? `results[${rowIndex}].${Object.keys(data[0]).find((key) => key !== ROW_ID_FIELD)}.${columnName}` : '';
  const isArray = Array.isArray(cellValue);

  let valueToRender: React.ReactNode;

  if (isArray) {
    if (!cellValue.length) {
      valueToRender = '[]';
    } else if (arrayInnerObjects && Object.keys(arrayInnerObjects.innerKeys).length !== 0) {
      const filteredHeadersData = Object.fromEntries(
        Object.entries(arrayInnerObjects).filter(([key]) => key !== ROW_ID_FIELD)
      ) as HeadersData;
      valueToRender = (
        <table className="w-full">
          {(cellValue as IdentifiedData[]).filter(Boolean).map((value, index) => (
            <ArrayCell
              headers={filteredHeadersData}
              key={value[ROW_ID_FIELD]}
              first={index === 0}
              value={value}
              cellTitle={`${cellTitle}[${index}]`}
            />
          ))}
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
}
