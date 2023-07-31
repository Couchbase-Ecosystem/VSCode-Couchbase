import { timeRangeOptions } from 'constants/monitoring';
import {
  Bucket,
  BucketDurabilityLevel,
  BucketListResponse,
  BucketType,
  CreateBucketFormPayload,
  CreateBucketPayload,
} from 'sync/bucket-service';

type TimeRange = {
  start: number;
  end: number;
};

export const newBucket = (): CreateBucketFormPayload => {
  return {
    backupSchedule: undefined,
    type: BucketType.Couchbase,
    bucketConflictResolution: 'seqno',
    durabilityLevel: 'none',
    flush: false,
    memoryAllocationInMb: 100,
    name: '',
    replicas: 0,
    storageBackend: 'couchstore',
    timeToLive: undefined,
    evictionPolicy: 'noEviction',
  };
};

export const toCreateBucketPayload = (bucket: CreateBucketFormPayload): CreateBucketPayload => {
  const { evictionPolicy, storageBackend, type, ...rest } = bucket;
  if (type === BucketType.Couchbase) {
    return {
      ...rest,
      storageBackend,
      type: BucketType.Couchbase,
    };
  }
  return {
    ...rest,
    evictionPolicy,
    type: BucketType.Ephemeral,
  };
};

export type MemoryAllocationType = {
  thisBucket: number;
  otherBuckets: number;
  remaining: number;
  actualRemaining: number;
};

export const getMemoryAllocation = (
  currentBucket: Pick<Bucket, 'name' | 'memoryAllocationInMb'>,
  response?: BucketListResponse
): MemoryAllocationType => {
  const thisBucket = currentBucket.memoryAllocationInMb;
  const totalMemory = response?.totalMemoryInMb || thisBucket;
  const otherBuckets =
    response?.buckets.data
      .filter((bucket) => bucket.data.name !== currentBucket.name)
      .reduce((memory, bucketData) => {
        return memory + bucketData.data.memoryAllocationInMb;
      }, 0) || 0;

  const remaining = totalMemory - otherBuckets - thisBucket;
  const actualRemaining = totalMemory - otherBuckets;

  return {
    thisBucket,
    otherBuckets,
    remaining,
    actualRemaining,
  };
};

const couchbaseBucketNameRegExp = /^[a-zA-Z\d-.%_]+$/;
export const couchbaseBucketNameMaxLength = 100;

export const validateBucketName = (name?: string) => {
  if (!name) {
    return 'Name is required';
  }

  if (name[0] === '.') {
    return 'Must not begin with a dot';
  }

  if (name.length > couchbaseBucketNameMaxLength) {
    return `Must be less than ${couchbaseBucketNameMaxLength} characters`;
  }

  if (!couchbaseBucketNameRegExp.test(name)) {
    return 'Invalid special or accent character';
  }

  return '';
};

/** isValidEphemeralDurability is a helper to let us easily check that the
 * durabilityLevel is valid when the bucket is an ephemeral bucket and change
 * value to fallback if not valid.
 * */
export const validEphemeralDurability = (bucket: CreateBucketFormPayload) => {
  let value: BucketDurabilityLevel = bucket.durabilityLevel;
  if (bucket.type !== BucketType.Ephemeral) {
    return null;
  }

  if (bucket.durabilityLevel !== 'none' && bucket.durabilityLevel !== 'majority') {
    value = 'none';
  }

  return value;
};

/** convertTimeRangeToSteps is a helper that protects us from wrong step values during
 *  zoom event on metrics.
 * */

export const convertTimeRangeToSteps = (timeRange: TimeRange) => {
  const timeDifference = timeRange.end - timeRange.start;
  const validTimestamp = timeRangeOptions.find((timestamp) => timestamp.time >= timeDifference);
  if (!validTimestamp) {
    return timeRangeOptions[timeRangeOptions.length - 1].step;
  }
  return validTimestamp.step;
};
