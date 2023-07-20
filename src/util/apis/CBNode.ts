class CBNode {
    public clusterMembership: string = '';
    public recoveryType: string = '';
    public status: string = '';
    public otpNode: string = '';
    public thisNode: boolean = false;
    public hostname: string = '';
    public nodeUUID: string = '';
    public clusterCompatibility?: number;
    public version: string = '';
    public os: string = '';
    public cpuCount?: number;
    public ports: Map<string, string> = new Map<string, string>();
    public services: string[] = [];
    public nodeEncryption: boolean = false;
    public addressFamilyOnly: boolean = false;
    public configuredHostname: string = '';
    public addressFamily: string = '';
    public serverGroup: string = '';
    public couchApiBase: string = '';
    public couchApiBaseHTTPS: string = '';
    public nodeHash?: number;
    // public systemStats?: SystemStats;
    // public interestingStats?: InterestingStats;
    public uptime: string = '';
    public memoryTotal?: number;
    public memoryFree?: number;
    public mcdMemoryReserved?: number;
    public mcdMemoryAllocated?: number;

}