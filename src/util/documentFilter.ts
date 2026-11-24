import { Memory } from "./util";

/**
 * Per-collection document filter state for the Documents tree.
 *
 * A collection has at most one active filter: a document ID range ("kv")
 * or a SQL++ WHERE clause ("query"). The state lives in session-only
 * `Memory.state`, scoped to the connection and collection. This module is
 * the only place that knows the storage keys.
 */
export type DocumentFilterType = "" | "kv" | "query";

export interface FilteredCollection {
  bucketName: string;
  scopeName: string;
  collectionName: string;
}

export interface DocumentFilter {
  type: DocumentFilterType;
  // WHERE clause for "query" filters; "" when unset
  queryFilter: string;
  // Document ID range for "kv" filters; "" means unbounded on that side
  kvStartDocId: string;
  kvEndDocId: string;
}

const keySuffix = (connectionId: string, c: FilteredCollection): string =>
  `${connectionId}-${c.bucketName}-${c.scopeName}-${c.collectionName}`;

const typeKey = (connectionId: string, c: FilteredCollection) => `filterDocumentsType-${keySuffix(connectionId, c)}`;
const queryKey = (connectionId: string, c: FilteredCollection) => `queryTypeFilterDocuments-${keySuffix(connectionId, c)}`;
const kvKey = (connectionId: string, c: FilteredCollection) => `kvTypeFilterDocuments-${keySuffix(connectionId, c)}`;

export const getDocumentFilter = (connectionId: string, collection: FilteredCollection): DocumentFilter => {
  const type = (Memory.state.get<string>(typeKey(connectionId, collection)) ?? "") as DocumentFilterType;
  const queryFilter = Memory.state.get<string>(queryKey(connectionId, collection)) ?? "";
  const [kvStartDocId = "", kvEndDocId = ""] = (Memory.state.get<string>(kvKey(connectionId, collection)) ?? "").split("|");
  return { type, queryFilter, kvStartDocId, kvEndDocId };
};

export const clearDocumentFilter = (connectionId: string, collection: FilteredCollection): void => {
  Memory.state.update(typeKey(connectionId, collection), "");
  Memory.state.update(queryKey(connectionId, collection), "");
  Memory.state.update(kvKey(connectionId, collection), "");
};

// Replaces any existing filter with a SQL++ WHERE clause filter
export const setQueryDocumentFilter = (connectionId: string, collection: FilteredCollection, whereClause: string): void => {
  clearDocumentFilter(connectionId, collection);
  Memory.state.update(typeKey(connectionId, collection), "query");
  Memory.state.update(queryKey(connectionId, collection), whereClause.trim());
};

// Replaces any existing filter with a document ID range filter
export const setKvDocumentFilter = (
  connectionId: string,
  collection: FilteredCollection,
  startDocId: string,
  endDocId: string
): void => {
  clearDocumentFilter(connectionId, collection);
  Memory.state.update(typeKey(connectionId, collection), "kv");
  Memory.state.update(kvKey(connectionId, collection), `${startDocId}|${endDocId}`);
};
