export type ProxyQueryPayload = {
  profile: 'timings';
  statement?: string;
  timeout: string;
  txId: string;
  txtimeout: string;
  use_cbo: boolean;
  query_context?: string;
};

export type ProxyQueryResponse = {
  results: Record<string, unknown>[];
  metrics?: {
    elapsedTime: string;
    executionTime: string;
    resultCount: number;
    resultSize: number;
    serviceLoad: number;
    usedMemory: number;
  };
};

export type ProxyBucket = {
  name: string;
  basicStats: {
    dataUsed: number;
    diskFetches: number;
    diskUsed: number;
    itemCount: number;
    memUsed: number;
    opsPerSec: number;
    quotaPercentUsed: number;
    vbActiveNumNonResident: number;
  };
  bucketType: string;
};

export type ProxyBucketListResponse = ProxyBucket[];

export type ProxyScopesListResponse = {
  scopes: {
    name: string;
    collections: Collection[];
  }[];
};

export type CreateProxyScopePayload = {
  name: string;
};

export type CreateProxyCollectionPayload = {
  name: string;
  maxTTL: number;
};

export type Collection = {
  name: string;
  maxTTL: number;
};

export type ProxyCollectionListResponse = Collection[];

export type DocumentListParams = {
  databaseId: string;
  bucket: string;
  scope: string;
  collection: string;
  limit: number;
  offset: number;
  startKey: string;
  endKey: string;
};

export type SingleDocParams = {
  databaseId: string;
  bucket: string;
  scope: string;
  collection: string;
  docId: string;
};

export type ProxyIndex = {
  storageMode: 'plasma' | 'couchstore';
  partitionMap: Record<string, number[]>;
  numPartition: number;
  partitioned: boolean;
  hosts: string[];
  stale: boolean;
  progress: number; // 0 to 100 percent
  definition: string; // e.g., "create primary index..."
  status: string; // includes 'ready', other values? TODO
  collection: string;
  scope: string;
  bucket: string;
  replicaId: number; // if > 1 replica, each gets integer Id: 0, 1, 2...
  numReplica: number;
  lastScanTime: string; // date of the last time the index was used
  index: string; // display name
  indexName: string; // internal name
  id: number; // id for index, may be duplicated with replication
  instId: number; // unique ID
  stats?: InterestingIndexStats;
};

export type InterestingIndexStats = {
  index_num_requests?: number;
  index_resident_percent?: number;
  index_items_count?: number;
  index_data_size?: number;
  index_memory_quota?: number;
  index_memory_used?: number;
  index_remaining_ram?: number;
  index_ram_percent?: number;
  index_fragmentation?: number;
  index_disk_size?: number;
  index_num_rows_returned?: number;
  index_num_rows_returned_5m?: number;
};

export type IndexListResponse = {
  indexes: ProxyIndex[];
};

export type IndexMetricLabel = {
  label: string;
  value: string;
};

export type IndexStatSpec = {
  step: number;
  timeWindow: number | string;
  start: number;
  metric: IndexMetricLabel[];
  nodesAggregation: string;
  applyFunctions?: string[];
};

export type IndexStatDetail = {
  metric: {
    nodes: string[];
    bucket: string;
    scope: string;
    collection: string;
    index: string;
    instance: string;
    name: keyof InterestingIndexStats;
  };
  values: number[][];
};

export type IndexStat = {
  data: IndexStatDetail[];
  errors: string[];
  startTimestamp: number;
  endTimestamp: number;
};

export type CollectionStatSpec = {
  step: number;
  timeWindow: number;
  start: number;
  metric: IndexMetricLabel[];
  nodesAggregation: string;
  applyFunctions?: string[];
};

export type CollectionCount = {
  bucket: string;
  scope: string;
  collection: string;
  itemCount: number;
};

export type TrustedCAs = {
  id: string;
  loadTimestamp: string;
  subject: string;
  notBefore: string;
  notAfter: string;
  type: string;
  pem: string;
  loadHost: string;
  loadFile: string;
  warnings: string[];
  nodes: string[];
}[];

export type DocumentResponse = {
  id: string;
  doc?: {
    json?: string;
  };
};

export type DocumentListResponse = {
  rows: DocumentResponse[];
  docsApiUnavailable?: boolean;
};

export type GetDocumentResponse = {
  xattrs: {};
  json?: string;
  meta: {
    id: string;
    rev: string;
    expiration: number;
    flags: 0;
  };
};
