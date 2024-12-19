import { defaultPaginationQuery, QueryOptions } from 'sync/query';
import { deleteRequest, getRequest, postRequest } from 'sync/request';
import { BackupContext, BucketContext, DatabaseContext } from 'sync/request.types';
import { BackupListResponse, BackupNowPayload, BucketBackupListResponse, RestoreBackupPayload } from './backup-service.types';

/**
 * Request to return a list of backups associated with a specified database.
 */
export const listBackups = (params: DatabaseContext, query: QueryOptions = defaultPaginationQuery) => {
  return getRequest<BackupListResponse>(
    `/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/backups`,
    { params: query }
  );
};

/**
 * Request to return a list of backups associated with a specified bucket.
 */
export const listBucketBackups = (params: BucketContext, query: QueryOptions = defaultPaginationQuery) => {
  return getRequest<BucketBackupListResponse>(
    `/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/buckets/${params.bucketId}/backups`,
    { params: query }
  );
};

/**
 * Request to delete a specified backup associated with a specified database.
 */
export const deleteBackup = (params: BackupContext) => {
  return deleteRequest<{}>(
    `/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/backups/${params.backupId}/cycle`
  );
};

/**
 * Request to restore a specified backup associated with a specified database.
 */
export const restoreBackup = (params: DatabaseContext, payload: RestoreBackupPayload) => {
  return postRequest<{}>(`/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/restore`, {
    data: payload,
  });
};

/**
 * Request to perform an immediate backup on a specified database.
 */
export const backupNow = (params: DatabaseContext, payload: BackupNowPayload) => {
  return postRequest<{}>(`/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/backup`, {
    data: payload,
  });
};
