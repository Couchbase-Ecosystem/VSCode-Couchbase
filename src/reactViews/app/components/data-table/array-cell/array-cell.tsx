import { HeadersData, ROW_ID_FIELD } from 'components/data-table/data-table.types';
import { uniqueId } from 'utils/unique-id/unique-id';

type ArrayCellProps = {
  value: Record<string, unknown>;
  headers: HeadersData;
  cellTitle: string;
  first?: boolean;
};

export function ArrayCell({ value, cellTitle, first, headers }: ArrayCellProps) {
  const headerCells = Object.keys(headers.innerKeys)
    .filter((key) => key !== ROW_ID_FIELD)
    .sort();

  const renderRowCells = (propertyName: string, valueToRender: unknown) => {
    if (Array.isArray(valueToRender)) {
      if (!valueToRender.length) {
        return '[]';
      }

      if (headers.innerKeys[propertyName].arrayInnerObjects) {
        return (
          <table className="w-full">
            {valueToRender.filter(Boolean).map((value, index) => (
              <ArrayCell
                headers={headers.innerKeys[propertyName].arrayInnerObjects!}
                key={uniqueId()}
                first={index === 0}
                value={value}
                cellTitle={`${cellTitle}.${propertyName}[${index}]`}
              />
            ))}
          </table>
        );
      }

      return (
        <ul>
          {valueToRender.map((value, index) => (
            <li title={`${cellTitle}.${propertyName}[${index}]`} key={value}>
              {value}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof valueToRender === 'object' && !!valueToRender) {
      return (
        <table className="w-full">
          <ArrayCell
            headers={headers.innerKeys[propertyName]}
            first
            value={valueToRender as Record<string, unknown>}
            cellTitle={`${cellTitle}.${propertyName}`}
          />
        </table>
      );
    }

    if (valueToRender === null) {
      return <span className="italic">{String(valueToRender)}</span>;
    }

    return String(valueToRender === undefined ? '' : valueToRender);
  };

  return (
    <>
      {first && (
        <thead>
          <tr className="text-left border-b border-[#d1d1d1] text-[#555] bg-[#eceff2]">
            {headerCells.map((key) => {
              return (
                <th className="text-opacity-50 font-normal pl-1 border-r border-[#d1d1d1]" key={key}>
                  {key}
                </th>
              );
            })}
          </tr>
        </thead>
      )}
      <tbody>
        <tr>
          {headerCells.map((headerCell) => (
            <td
              title={`${cellTitle}.${headerCell}`}
              style={{
                minWidth: `${headers.innerKeys[headerCell].size}ch`,
                maxWidth: `${headers.innerKeys[headerCell].size}ch`,
              }}
              className="pl-1 align-top"
              key={headerCell}
            >
              {renderRowCells(headerCell, value[headerCell])}
            </td>
          ))}
        </tr>
      </tbody>
    </>
  );
}
