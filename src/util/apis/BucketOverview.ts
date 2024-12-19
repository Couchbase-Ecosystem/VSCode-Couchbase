import { BasicBucketStats } from "./BasicBucketStats";
import { BucketQuota } from "./BucketQuota";

export class BucketOverview {
    public name: string = '';
    public nodeLocator: string = '';
    public bucketType: string = '';
    public storageBackend: string = '';
    public uuid: string = '';
    public uri: string = '';
    public streamingUri: string = '';
    public bucketCapabilitiesVer: string = '';
    public bucketCapabilities: string[] = [];
    public autoCompactionSettings: boolean | null = null;
    public replicaIndex: boolean | null = null;
    public replicaNumber: number | null = null;
    public threadsNumber: number | null = null;
    public evictionPolicy: string = '';
    public durabilityMinLevel: string = '';
    public pitrEnabled: boolean | null = null;
    public pitrGranularity: number | null = null;
    public pitrMaxHistoryAge: number | null = null;
    public conflictResolutionType: string = '';
    public maxTTL: number | null = null;
    public compressionMode: string = '';
    public quota: BucketQuota | null = null;
    public basicStats: BasicBucketStats | null = null;
}