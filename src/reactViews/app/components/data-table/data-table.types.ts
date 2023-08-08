export type HeadersData = {
  arrayInnerObjects: HeadersData | null;
  arrayInnerPrimitives: HeadersData | null;
  innerKeys: Record<string, HeadersData>;
  maxSize: number;
  size: number;
  maxObjectSize: number;
  type: Record<string, boolean>;
};
