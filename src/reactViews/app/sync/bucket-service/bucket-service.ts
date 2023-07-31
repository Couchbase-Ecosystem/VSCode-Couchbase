import { defaultPaginationQuery, QueryOptions } from 'sync/query';
import { deleteRequest, getRequest, postRequest, putRequest } from 'sync/request';
import { AppServiceContext, BucketContext, DatabaseContext } from 'sync/request.types';
import {
  BucketList,
  BucketListResponse,
  BucketResponse,
  CreateBucketPayload,
  ScopeListResponse,
  UpdateBucketPayload,
} from './bucket-service.types';

export function listBucketServices(
  { projectId, organizationId, databaseId }: DatabaseContext,
  params: QueryOptions = defaultPaginationQuery
) {
  return getRequest<BucketListResponse>(`/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/buckets`, {
    params,
  });
}

/**
 * Request to list buckets which are eligible to have app endpoints created
 * for the given app service and database.
 */
export function listAppServiceEligibleBucketService({ appServiceId, organizationId, databaseId, projectId }: AppServiceContext) {
  return getRequest<BucketList>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/eligible-buckets`
  );
}

/**
 * Request to list buckets associated with a given database.
 */
export function listScopesBucketService({ bucketId, organizationId, databaseId, projectId }: BucketContext) {
  return getRequest<ScopeListResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/buckets/${bucketId}/scopes`
  );
}

/**
 * Request to return a given bucket.
 */
export function getBucketService({ bucketId, organizationId, databaseId, projectId }: BucketContext) {
  return getRequest<BucketResponse>(`/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/buckets/${bucketId}`);
}

/**
 * Request to create a bucket in a specified database.
 */
export function createBucketService({ projectId, organizationId, databaseId }: DatabaseContext, data: CreateBucketPayload) {
  return postRequest<BucketResponse>(`/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/buckets`, { data });
}

/**
 * Request to update a given bucket.
 */
export function updateBucketService({ bucketId, organizationId, databaseId, projectId }: BucketContext, data: UpdateBucketPayload) {
  return putRequest<BucketResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/buckets/${bucketId}`,
    {
      data,
    }
  );
}

/**
 * Request to flush a given bucket
 */
export function flushBucketService({ bucketId, organizationId, databaseId, projectId }: BucketContext) {
  return postRequest<BucketResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/buckets/${bucketId}/flush`
  );
}

/**
 * Request to delete a given bucket.
 */
export function deleteBucketService({ bucketId, organizationId, databaseId, projectId }: BucketContext) {
  return deleteRequest<unknown>(`/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/buckets/${bucketId}`);
}
