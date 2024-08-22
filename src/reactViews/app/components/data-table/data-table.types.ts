export type HeadersData = {
  arrayInnerObjects: HeadersData | null;
  arrayInnerPrimitives: HeadersData | null;
  innerKeys: Record<string, HeadersData>;
  maxSize: number;
  size: number;
  maxObjectSize: number;
  type: Record<string, boolean>;
};

export const ROW_ID_FIELD = '__uuid__' as const;

export type IdentifiedData<T = object> = T extends object
  ? T extends any[]
    ? IdentifiedData<T[number]>[]
    : Record<typeof ROW_ID_FIELD, string> & {
        [key in keyof T]: IdentifiedData<T[key]>;
      }
  : T;