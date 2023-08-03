import { deleteRequest, getRequest, postRequest } from 'sync/request';
import { ProxyBucketContext, ProxyCollectionContext, ProxyContext, ProxyScopeContext } from 'sync/request.types';
import type {
  CollectionCount,
  CollectionStatSpec,
  CreateProxyCollectionPayload,
  CreateProxyScopePayload,
  DocumentListParams,
  DocumentListResponse,
  GetDocumentResponse,
  IndexListResponse,
  IndexStat,
  IndexStatSpec,
  ProxyBucketListResponse,
  ProxyIndex,
  ProxyQueryPayload,
  ProxyQueryResponse,
  ProxyScopesListResponse,
  SingleDocParams,
  TrustedCAs,
} from './proxy-service.types';
import { doubleEncode } from './proxy-service.utils';

/*
 * Query requests can take many parameters, some optional
 *
 * Mandatory:
 *	 databaseId
 *   statement - the query to run
 *   timeout - a string measuring duration, e.g. "600s" for 600 seconds
 *
 * Optional:
 *   profile - set to "timings" for user queries where analysis is desired
 *   max_parallelism
 *   scan_consistency
 *   use_cbo - whether to use cost-based optimizer (true/false)
 *   positional_parameters - array of values
 *   named_parameters - map of names and values
 *   query_context - default scope of the form 'default:<bucket_name>.<scope_name>'
 *   client_context_id - a UUID used to cancel the query if needed
 *   pretty - should the query result be formatted? It takes up more space.
 *
 *   tx_timeout - timeout if running as a transaction
 *   tximplicit - whether to run a single query as a transaction
 *   txid - to link multiple requests in a transaction, a 'txid' is returned
 *      by the first START WORK, and must be included with each successive query request
 *      until the transaction is complete.
 */

const headers = { 'Content-Type': 'application/json' };

/**
 * **Proxy** return a list of buckets for a specified database.
 */
export function listBucketsProxyService({ databaseId }: ProxyContext) {
  return getRequest<ProxyBucketListResponse>(`/v2/databases/${databaseId}/proxy/pools/default/buckets`, {
    headers,
  });
}

/**
 * **Proxy** return a list of scopes for a specified bucket.
 */
export function listScopesProxyService({ bucketId, databaseId }: ProxyBucketContext) {
  return getRequest<ProxyScopesListResponse>(`/v2/databases/${databaseId}/proxy/pools/default/buckets/${doubleEncode(bucketId)}/scopes`, {
    headers,
  });
}

/**
 * **Proxy** request to create a scope on a specified bucket.
 */
export function createScopeProxyService({ databaseId, bucketId }: ProxyBucketContext, data: CreateProxyScopePayload) {
  return postRequest<{}>(`/v2/databases/${databaseId}/proxy/pools/default/buckets/${doubleEncode(bucketId)}/scopes`, {
    data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
  });
}

/**
 * **Proxy** request to delete the named scope
 */
export function deleteScopeProxyService({ scopeId, bucketId, databaseId }: ProxyScopeContext) {
  return deleteRequest<{}>(
    `/v2/databases/${databaseId}/proxy/pools/default/buckets/${doubleEncode(bucketId)}/scopes/${doubleEncode(scopeId)}`,
    { headers }
  );
}

/**
 * To get collection document counts from the REST API, need to use stats api
 */
export function getCollectionCountsProxyService(
  { databaseId }: ProxyContext,
  collections: ProxyCollectionContext[]
): Promise<CollectionCount[]> {
  // for each given index, we need several stats
  const collectionStats: CollectionStatSpec[] = collections.map(({ collectionId, scopeId, bucketId }) => {
    return {
      step: 3,
      timeWindow: 360,
      start: -3,
      metric: [
        { label: 'name', value: 'kv_collection_item_count' },
        { label: 'bucket', value: bucketId },
        { label: 'scope', value: scopeId },
        { label: 'collection', value: collectionId },
      ],
      nodesAggregation: 'sum',
    };
  });

  return postRequest(`/v2/databases/${databaseId}/proxy/pools/default/stats/range/`, { data: collectionStats });
}

/**
 * **Proxy** request to create a collection against a specified scope.
 */
export function createCollectionProxyService(
  { scopeId, bucketId, databaseId }: ProxyScopeContext,
  { name, maxTTL }: CreateProxyCollectionPayload
) {
  const data = new URLSearchParams(); // params need to be URL-encoded
  data.set('name', name);
  data.set('maxTTL', String(maxTTL));

  return postRequest<{}>(
    `/v2/databases/${databaseId}/proxy/pools/default/buckets/${doubleEncode(bucketId)}/scopes/${doubleEncode(scopeId)}/collections`,
    { data, headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }
  );
}

/**
 * **Proxy** return a list of documents for a specified scope collection.
 */
export function listDocumentsProxyService({
  bucketId,
  databaseId,
  scopeId,
  skip,
  limit,
  collectionId,
}: ProxyCollectionContext & { skip: number; limit: number }) {
  return getRequest<DocumentListResponse>(
    `/v2/databases/${databaseId}/proxy/pools/default/buckets/${doubleEncode(bucketId)}/scopes/${doubleEncode(
      scopeId
    )}/collections/${doubleEncode(collectionId)}/docs`,
    {
      headers,
      params: {
        skip,
        limit,
        include_docs: true,
      },
    }
  );
}

/**
 * **Proxy** return a list of documents for a database that doesn't support scopes.
 */
export function istDocumentsV6ProxyService({
  bucketId,
  databaseId,
  skip,
  limit,
}: Omit<ProxyCollectionContext, 'scopeId' | 'collectionId'> & {
  skip: number;
  limit: number;
}) {
  return getRequest<DocumentListResponse>(`/v2/databases/${databaseId}/proxy/pools/default/buckets/${bucketId}/docs`, {
    headers,
    params: {
      skip,
      limit,
      include_docs: true,
    },
  });
}

/**
 * **Proxy** request to delete the named scope
 */
export function deleteCollectionProxyService({ collectionId, scopeId, bucketId, databaseId }: ProxyCollectionContext) {
  return deleteRequest<{}>(
    `/v2/databases/${databaseId}/proxy/pools/default/buckets/${doubleEncode(bucketId)}/scopes/${doubleEncode(
      scopeId
    )}/collections/${doubleEncode(collectionId)}`,
    { headers }
  );
}

/**
 * **Proxy** return a certificate for a specified bucket/database.
 * @remarks Only to be used for database version before 7.1.2.
 */
export function getCertificateProxyService({ databaseId }: ProxyContext) {
  return getRequest<string>(`/v2/databases/${databaseId}/proxy/pools/default/certificate`, { headers });
}

/**
 * **Proxy** return a certificate for a specified bucket/database.
 * @remarks Only to be used for database version 7.1.2+.
 */
export function getTrustedCAsProxyService({ databaseId }: ProxyContext) {
  return getRequest<TrustedCAs>(`/v2/databases/${databaseId}/proxy/pools/default/trustedCAs`, { headers });
}

/**
 * **Queryable** request to return a list of results from a specified database.
 * @param data
 */
export function queryProxyService({ databaseId }: ProxyContext, data: ProxyQueryPayload) {
  return postRequest<ProxyQueryResponse>(`/v2/databases/${databaseId}/proxy/_p/query/query/service`, { data });
}

/**
 * get a list of document IDs from the KV service
 * NB: setting "include_docs=true" might seem a shortcut, but with that option set we
 * don't get any metadata or xattrs for the documents.
 */
export function getDocumentIdsProxyService({ databaseId, bucket, scope, collection, limit, startKey, endKey, offset }: DocumentListParams) {
  return getRequest<DocumentListResponse>(
    `/v2/databases/${databaseId}/proxy/pools/default/buckets/${doubleEncode(bucket)}/scopes/${doubleEncode(
      scope
    )}/collections/${doubleEncode(collection)}/docs`,
    {
      params: {
        skip: offset,
        limit,
        include_docs: false,
        startKey: startKey ? `%22${doubleEncode(startKey)}%22` : '',
        endKey: endKey ? `%22${doubleEncode(endKey)}%22` : '',
      },
    }
  );
}

/**
 * get a single document, including Metadata and XAttrs, from the KV service
 */
export function getSingleDocProxyService({ docId, collection, databaseId, bucket, scope }: SingleDocParams) {
  return getRequest<GetDocumentResponse>(
    `/v2/databases/${databaseId}/proxy/pools/default/buckets/${doubleEncode(bucket)}/scopes/${doubleEncode(
      scope
    )}/collections/${doubleEncode(collection)}/docs/${doubleEncode(docId)}`
  );
}

/**
 * get a single document for a database that doesn't support scopes, including Metadata and XAttrs, from the KV service
 */
export function getSingleDocV6ProxyService({ docId, databaseId, bucket }: Omit<SingleDocParams, 'scope' | 'collection'>) {
  return getRequest<GetDocumentResponse>(`/v2/databases/${databaseId}/proxy/pools/default/buckets/${bucket}/docs/${doubleEncode(docId)}`);
}

/**
 * delete a single document by its Id
 */
export function deleteSingleDocProxyService({ docId, collection, bucket, scope, databaseId }: SingleDocParams) {
  return deleteRequest<{}>(
    `/v2/databases/${databaseId}/proxy/pools/default/buckets/${doubleEncode(bucket)}/scopes/${doubleEncode(
      scope
    )}/collections/${doubleEncode(collection)}/docs/${doubleEncode(docId)}`
  );
}

/**
 * delete a single document by its Id
 */
export function deleteSingleDocV6ProxyService({ docId, bucket, databaseId }: Omit<SingleDocParams, 'scope' | 'collection'>) {
  return deleteRequest<{}>(`/v2/databases/${databaseId}/proxy/pools/default/buckets/${bucket}/docs/${doubleEncode(docId)}`);
}

/**
 * save a single document (either new or overwriting existing) to the server
 */
export function saveSingleDocumentProxyService({ bucket, scope, collection, docId, databaseId }: SingleDocParams, newJson: string) {
  const data = new URLSearchParams();
  data.set('flags,', '0x02000006');
  data.set('value', newJson);

  return postRequest<ProxyQueryResponse>(
    `/v2/databases/${databaseId}/proxy/pools/default/buckets/${bucket}/scopes/${scope}/collections/${collection}/docs/${doubleEncode(
      docId
    )}`,
    { data, headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }
  );
}

/**
 * save a single document (either new or overwriting existing) to the server for a database that doesn't support scopes
 */
export function saveSingleDocumentV6ProxyService(
  { databaseId, bucket, docId }: Omit<SingleDocParams, 'scope' | 'collection'>,
  newJson: string
) {
  const data = new URLSearchParams();
  data.set('flags,', '0x02000006');
  data.set('value', newJson);

  return postRequest<ProxyQueryResponse>(`/v2/databases/${databaseId}/proxy/pools/default/buckets/${bucket}/docs/${doubleEncode(docId)}`, {
    data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
  });
}

/**
 * retrieve the list of indexes
 */
export function listIndexesProxyService({ databaseId }: ProxyContext) {
  return getRequest<IndexListResponse>(`/v2/databases/${databaseId}/proxy/indexStatus`);
}

/**
 * Internal utility function to create the structure needed by the API to get a stat
 * for a given index. The values specified here are for getting the most recent stats, other
 * values would be used to get enough values for a chart.
 */

function getStatForIndex(
  idx: ProxyIndex,
  statName: string,
  aggr: string,
  fns?: string[],
  timeWindow?: string,
  isGeneral?: boolean
): IndexStatSpec {
  return {
    step: 3,
    timeWindow: timeWindow || 360,
    start: -3,
    metric: isGeneral
      ? [{ label: 'name', value: statName }]
      : [
          { label: 'name', value: statName },
          { label: 'bucket', value: idx.bucket },
          { label: 'scope', value: idx.scope },
          { label: 'collection', value: idx.collection },
          { label: 'index', value: idx.index },
        ],
    nodesAggregation: aggr,
    applyFunctions: fns,
  };
}

export function getGeneralStats(statName: string, aggr: string, bucket?: string): IndexStatSpec {
  return {
    step: 3,
    timeWindow: 360,
    start: -3,
    metric: bucket
      ? [
          { label: 'name', value: statName },
          { label: 'bucket', value: bucket },
        ]
      : [{ label: 'name', value: statName }],
    nodesAggregation: aggr,
  };
}

/**
 * Given a list of indexes returned from listIndexes, we need to call stats/range to get
 * stats for each index. Right now there are 4 stats that we want to display, but additional
 * stats can be added as needed.
 */
export function getIndexStatsRequestsProxyService({ databaseId }: ProxyContext, indexes: IndexListResponse) {
  const statsParams: IndexStatSpec[] = [];

  // for each given index, we need several stats
  indexes.indexes.forEach((proxyIndex) => {
    statsParams.push(getStatForIndex(proxyIndex, 'index_num_requests', 'sum', ['irate']));
    statsParams.push(getStatForIndex(proxyIndex, 'index_resident_percent', 'special'));
    statsParams.push(getStatForIndex(proxyIndex, 'index_items_count', 'sum'));
    // Index Data Size
    statsParams.push(getStatForIndex(proxyIndex, 'index_data_size', 'sum'));
    // RAM Used/Remaining
    statsParams.push(getStatForIndex(proxyIndex, 'index_memory_used', 'sum'));
    // Index Disk Size
    statsParams.push(getStatForIndex(proxyIndex, 'index_disk_size', 'sum'));
    // Total Scan Rate
    // the number and order of the requested index_num_rows_returned stats is important here.
    // displayIndexStats function logic depends on that.
    statsParams.push(getStatForIndex(proxyIndex, 'index_num_rows_returned', 'sum', ['irate']));
    // Scan Rate (over 5 minutes)
    statsParams.push(getStatForIndex(proxyIndex, 'index_num_rows_returned', 'sum', ['irate'], '5m'));
  });

  const batchSize = 1050; // BE seems to work best with requests < 600 kB in size
  const batches = Math.ceil(statsParams.length / batchSize);
  const batchRequests = [...Array(batches).keys()].map((slice) => {
    return postRequest<IndexStat[]>(`/v2/databases/${databaseId}/proxy/pools/default/stats/range/`, {
      params: statsParams.slice(slice * batchSize, (slice + 1) * batchSize),
    });
  });
  return batchRequests;
}

export function getGeneralIndexStatsRequestsProxyService({ databaseId }: ProxyContext, bucket: string) {
  return postRequest<IndexStat[]>(`/v2/databases/${databaseId}/proxy/pools/default/stats/range/`, {
    params: [
      getGeneralStats('index_memory_quota', 'sum'),
      getGeneralStats('index_remaining_ram', 'special'),
      getGeneralStats('index_ram_percent', 'special'),
      getGeneralStats('index_fragmentation', 'special', bucket),
    ],
  });
}
/** ***************************************************************************
 * Analytics API
 */

/**
 * Run a query against the analytics service
 * @param {ProxyContext} context - holds databaseIdb
 * include statement, which is the query text.
 * @param data
 */
export function analyticsQueryProxyService({ databaseId }: ProxyContext, data: Record<string, unknown>) {
  return postRequest<ProxyQueryResponse>(`/v2/databases/${databaseId}/proxy/_p/cbas/query/service`, {
    data,
    headers: { 'Content-Type': 'application/json', accept: 'application/json, text/plain, */*' },
  });
}

/**
 * get information about a single link from the analytics service
 */
export function getAnalyticsLinkProxyService({ databaseId }: ProxyContext) {
  return getRequest<ProxyQueryResponse>(`/v2/databases/${databaseId}/proxy/_p/cbas/analytics/link`, { headers });
}
