import { HeadersData, IdentifiedData, ROW_ID_FIELD } from './data-table.types';

const CHARACTER_PADDING = 3;
const BOOLEAN_WIDTH = 5;
const NUMBER_WIDTH_MULTIPLIER = 1.1;
const MAX_FIELD_WIDTH = 80;

export const getHeadersStructure = (data: unknown, headersData: HeadersData | null) => {
  const headersToUpdate = headersData || {
    innerKeys: {},
    arrayInnerObjects: null,
    arrayInnerPrimitives: null,
    maxSize: 0,
    size: 0,
    maxObjectSize: 0,
    type: { isArray: true },
  };

  let columnWidth = 0;

  if (typeof data === 'number') {
    headersToUpdate.type = { isNumber: true };
    columnWidth = String(data).length * NUMBER_WIDTH_MULTIPLIER + CHARACTER_PADDING;
  }

  if (typeof data === 'string') {
    headersToUpdate.type = { isString: true };
    columnWidth = data.length + CHARACTER_PADDING;
  }

  if (typeof data === 'boolean') {
    headersToUpdate.type = { isBoolean: true };
    columnWidth = BOOLEAN_WIDTH + CHARACTER_PADDING;
  }

  if (Array.isArray(data)) {
    headersToUpdate.type = { isArray: true };
    data.forEach((item) => {
      if (typeof item === 'object' && !Array.isArray(item) && data) {
        headersToUpdate.arrayInnerObjects = getHeadersStructure(item, headersToUpdate.arrayInnerObjects);
      } else {
        headersToUpdate.arrayInnerPrimitives = getHeadersStructure(item, headersToUpdate.arrayInnerPrimitives);
      }
    });

    if (headersToUpdate.arrayInnerObjects) {
      columnWidth = headersToUpdate.arrayInnerObjects.maxSize;
    }
    if (headersToUpdate.arrayInnerPrimitives) {
      columnWidth += headersToUpdate.arrayInnerPrimitives.maxSize;
    }
  } else if (typeof data === 'object' && data) {
    headersToUpdate.type = { isObject: true };
    Object.entries(data).forEach(([key, value]) => {
      headersToUpdate.innerKeys[key] = getHeadersStructure(value, headersToUpdate.innerKeys[key]);
      columnWidth += headersToUpdate.innerKeys[key].maxSize;
    });

    if (columnWidth > headersToUpdate.maxObjectSize) {
      headersToUpdate.maxObjectSize = columnWidth;
    }
  }

  if (columnWidth > headersToUpdate.maxSize) {
    headersToUpdate.maxSize = columnWidth;
  }

  return headersToUpdate;
};

export const finalizeFieldWidths = (data: HeadersData) => {
  const headerData = JSON.parse(JSON.stringify(data)) as HeadersData;

  if (headerData.type.isNumber || headerData.type.isBoolean) {
    headerData.size = headerData.maxSize + CHARACTER_PADDING;
  }

  if (headerData.type.isString) {
    headerData.size = Math.ceil(Math.min(MAX_FIELD_WIDTH, headerData.maxSize));
  }

  if (headerData.type.isArray) {
    let arraySize = headerData.size;
    if (headerData.arrayInnerObjects) {
      headerData.arrayInnerObjects = finalizeFieldWidths(headerData.arrayInnerObjects);
      // STOP
      arraySize = headerData.arrayInnerObjects.size + 0.5;
    }
    if (headerData.arrayInnerPrimitives) {
      headerData.arrayInnerPrimitives = finalizeFieldWidths(headerData.arrayInnerPrimitives);
      arraySize += headerData.arrayInnerPrimitives.size + 0.5;
    }

    if (!headerData.size || arraySize > headerData.size) {
      headerData.size = arraySize;
    }
  }

  if (headerData.type.isObject) {
    let size = headerData.size || 0;
    Object.entries(headerData.innerKeys).forEach(([key, value]) => {
      headerData.innerKeys[key] = finalizeFieldWidths(value);
      const nameSize = key.length + CHARACTER_PADDING;
      if (nameSize > headerData.innerKeys[key].size) {
        headerData.innerKeys[key].size = nameSize;
      }
      size += Math.max(headerData.innerKeys[key].size, nameSize);
    });

    if (!headerData.size || size > headerData.size) {
      headerData.size = size + 0.7;
    }
  }
  return headerData;
};

export const getHeadersStructureAndWidths = (data: unknown) => {
  const headersStructure = getHeadersStructure(data, null);
  return finalizeFieldWidths(headersStructure);
};
let counter = 0;
export function getIdentifiedData<T extends object>(data: T[]): IdentifiedData<T>[] {
  const result: IdentifiedData<T>[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (Array.isArray(item)) {
      result[i] = getIdentifiedData(item) as IdentifiedData<T>;
    } else if (item && typeof item === 'object') {
      const newItem: any = {
        [ROW_ID_FIELD]: counter++,
      };

      const keys = Object.keys(item);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        const value = item[key as keyof T];
        if (Array.isArray(value)) {
          newItem[key] = getIdentifiedData(value);
        } else if (value && typeof value === 'object') {
          [newItem[key]] = getIdentifiedData([value]);
        } else {
          newItem[key] = value;
        }
      }

      result[i] = newItem;
    } else {
      // @ts-ignore
      result[i] = item;
    }
  }
  return result;
}
