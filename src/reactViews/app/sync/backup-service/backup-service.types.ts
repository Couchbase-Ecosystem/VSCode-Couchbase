import { BackupDailyIncrement, BackupHourlyIncrement, BackupRetention, DayOfWeek, HourOfDay } from 'constants/backup';
import { RbacArrayResponse, RbacListResponse, RbacResponse } from 'sync/response.types';

export type BackupsParams = {
  date: string;
};

export type BackupMethod = 'full' | 'incremental';
export type BackupProvider = 'hostedAWS' | 'hostedGCP';
export type BackupSource = 'scheduled' | 'manual';
export type BackupStatus = 'ready' | 'complete' | 'pending' | 'failed';
export type BackupInterval = 'hourly' | 'daily' | 'weekly' | 'none';

export type Status = 'pending' | 'loading' | 'error' | 'success' | 'default' | 'warning' | 'active';
export type ExportedBackupStatus = Status & 'complete' & 'processing';

export type Backup = {
  bucket: string;
  bucketId: string;
  cbas: number;
  clusterId: string;
  date: string | null;
  elapsedTimeInSeconds: number;
  event: number;
  fts: number;
  gsi: number;
  id: string;
  items: number;
  method: BackupMethod;
  restoreBefore: string | null;
  projectId: string;
  provider: BackupProvider;
  sizeInMb: number;
  source: BackupSource;
  status: BackupStatus;
  tenantId: string;
  tombstones: number;
  schedule: {
    increment: number;
    retention: string;
    time: string;
    type: string;
  };
};

export type BucketBackup = {
  id: string;
  bucket: string;
  bucketId: string;
  cbas: number;
  date: string | null;
  event: number;
  fts: number;
  gsi: number;
  items: number;
  method: BackupMethod;
  restoreBefore: string | null;
  source: BackupSource;
  status: BackupStatus;
  sizeInMb: number;
  tombstones: number;
  idx: string;
  week?: string;
  cycle: {
    index: number;
    total: number;
  };
  schedule?: {
    increment: number;
    retention: string;
    time: string;
    type: string;
  };
};

export type ExportedBackup = {
  id: string;
  cycleID: string;
  bucketID: string;
  bucketName: string;
  status: ExportedBackupStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  cycle?: {
    firstBackupTime?: string;
    lastBackupTime?: string;
    source?: string;
  };
  expiration?: string;
  sizeInBytes?: number;
};

export type ExportBackupLink = {
  link: string;
};

export type RestoreBackupPayload = {
  sourceClusterId: string;
  targetClusterId: string;
  backupId: string;
  options: {
    services: string[];
    filterKeys: string;
    filterValues: string;
    includeData: string;
    excludeData: string;
    autoRemoveCollections: boolean;
    forceUpdates: boolean;
    autoCreateBuckets: boolean;
    replaceTTL?: string;
    replaceTTLWith?: string;
  };
};

export type DailyBackupSchedule = {
  day?: DayOfWeek;
  hour: HourOfDay;
  incrementalInterval: {
    value: BackupHourlyIncrement;
    unit: 'hourly';
  };
  fullInterval: 'daily';
  retentionTime: BackupRetention;
};

// Backwards compatible type which allows the UI to accept daily incremental backups.
export type WeeklyBackupScheduleIncrementalIntervalBC = {
  value: 1;
  unit: 'daily';
};

export type WeeklyBackupScheduleIncrementalIntervalCurr = {
  value: BackupDailyIncrement;
  unit: 'hourly';
};

export type WeeklyBackupScheduleIncrementalInterval =
  | WeeklyBackupScheduleIncrementalIntervalBC
  | WeeklyBackupScheduleIncrementalIntervalCurr;

export type WeeklyBackupSchedule = {
  day: DayOfWeek;
  hour: HourOfDay;
  incrementalInterval: WeeklyBackupScheduleIncrementalInterval;
  fullInterval: 'weekly';
  retentionTime: BackupRetention;
  costOptimizedRetention: boolean;
};

export type BackupSchedule = WeeklyBackupSchedule | DailyBackupSchedule | null;

export type BackupNowPayload = {
  bucket: string;
};

export type BucketBackupListResponse = {
  backups: RbacArrayResponse<BucketBackupResponse>;
  start: string;
  end: string;
};

export type BackupResponse = RbacResponse<Backup>;
export type BucketBackupResponse = RbacResponse<BucketBackup>;
export type BackupListResponse = RbacListResponse<BackupResponse>;
