import type { TimeUnits } from 'constants/backup';
import type { BackupSchedule } from 'sync/backup-service';
import type { RbacListResponse, RbacResponse } from 'sync/response.types';

export type BucketResources = 'clusterBucketsBackupConfig';
export type BucketConflictResolution = 'seqno' | 'lww';
export type BucketDurabilityLevel = 'none' | 'majority' | 'majorityAndPersistActive' | 'persistToMajority';
export type BucketReplicas = 0 | 1 | 2 | 3;
export type BucketStorageBackend = 'magma' | 'couchstore';

export type BucketTTL = {
  unit: TimeUnits;
  value: number;
};

type BucketEviction = 'nruEviction' | 'noEviction';

export type Bucket = {
  type: BucketType;
  backupSchedule: BackupSchedule;
  bucketConflictResolution: BucketConflictResolution;
  durabilityLevel?: BucketDurabilityLevel;
  evictionPolicy: BucketEviction;
  flush?: boolean;
  id: string;
  memoryAllocationInMb: number;
  name: string;
  replicas: number;
  storageBackend: BucketStorageBackend;
  stats: {
    diskUsedInMib: number;
    itemCount: number;
    memoryUsedInMib: number;
    opsPerSecond: number;
  };
  timeToLive?: BucketTTL | null;
};

export type BucketResponse = RbacResponse<Bucket>;
export type BucketList = RbacListResponse<BucketResponse>;
export type BucketListResponse = {
  buckets: BucketList;
  freeMemoryInMb: number;
  totalMemoryInMb: number;
  maxReplicas: number;
};

export enum BucketType {
  /** The bucket type of 'Couchbase' should be used for the vast majority of cases. */
  Couchbase = 'couchbase',
  Ephemeral = 'ephemeral',
}

type BaseCreateBucketPayload = {
  name: string;
  replicas: BucketReplicas;
  timeToLive?: BucketTTL | null;
  memoryAllocationInMb: number;
  flush: boolean;
  bucketConflictResolution: BucketConflictResolution;
};

export type CreateCouchbaseBucketPayload = BaseCreateBucketPayload & {
  type: BucketType.Couchbase;
  storageBackend: BucketStorageBackend;
  durabilityLevel: BucketDurabilityLevel;
  backupSchedule?: BackupSchedule;
};

export type CreateEphemeralBucketPayload = BaseCreateBucketPayload & {
  type: BucketType.Ephemeral;
  evictionPolicy: BucketEviction;
  durabilityLevel: BucketDurabilityLevel;
};

/** The payload for creating a new bucket must be either and ephemeral bucket or a couchbase
 * bucket. */
export type CreateBucketPayload = CreateCouchbaseBucketPayload | CreateEphemeralBucketPayload;

/** The payload for creating a bucket can be either a Couchbase or
 * Ephemeral bucket payload. CreateBucketFormPayload contains all fields used
 * for both types of buckets and will need to be transformed before sending the data to the create bucket API.
 * */
export type CreateBucketFormPayload = Omit<CreateCouchbaseBucketPayload, 'type'> &
  Omit<CreateEphemeralBucketPayload, 'type'> & {
    type: BucketType;
  };

export type UpdateBucketPayload = Partial<Bucket>;

//	This is a partial type of the actual returned response.
//	Due to the sheer volume of data not consumed by the UI, we are limiting this intentionally.
export type Scope = {
  name: string;
  maxTTL: number;
};

export type ScopeResponse = RbacResponse<Scope>;
export type ScopeListResponse = RbacListResponse<ScopeResponse>;
