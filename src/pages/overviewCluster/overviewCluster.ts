import * as vscode from "vscode";
import * as path from "path";
import { getClusterOverview } from "../../webViews/clusterOverview.webview";
import { ClusterConnectionNode } from "../../model/ClusterConnectionNode";
import { Memory } from "../../util/util";
import { IConnection } from "../../types/IConnection";
import { Constants } from "../../util/constants";
import { logger } from "../../logger/logger";
import { IClusterOverview } from "../../types/IClusterOverview";
import { Bucket, BucketSettings } from "couchbase";
import { CouchbaseRestAPI } from "../../util/apis/CouchbaseRestAPI";
import { ServerOverview } from "../../util/apis/ServerOverview";
import { IKeyValuePair } from "../../types/IKeyValuePair";
import { BucketOverview } from "../../util/apis/BucketOverview";
import { BucketDetails } from "../../util/OverviewClusterHelper";
import { CBNode } from "../../util/apis/CBNode";

const getNodeTabDetails = (NodeDetails: CBNode | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (NodeDetails === undefined) {
        return details;
    }

    // Couchbase Version
    details.push({
        key: Constants.COUCHBASEVERSIONKEY,
        value: NodeDetails.version
    });

    // Status
    details.push({
        key: Constants.STATUS,
        value: NodeDetails.status || "NA"
    });

    // Membership
    details.push({
        key: Constants.MEMBERSHIP,
        value: NodeDetails.clusterMembership || "NA"
    });

    // Services
    details.push({
        key: Constants.SERVICES,
        value: NodeDetails.services.join(', ') || "NA"
    });

    // OS
    details.push({
        key: Constants.OS,
        value: NodeDetails.os || "NA"
    });

    // Hostname
    details.push({
        key: Constants.HOSTNAME,
        value: NodeDetails.hostname || "NA"
    });

    // Node Encryption
    details.push({
        key: Constants.NODE_ENCRYPTION,
        value: String(NodeDetails.nodeEncryption) || "NA"
    });

    // Up Time
    details.push({
        key: Constants.UPTIME,
        value: (NodeDetails.uptime) || "NA"
    });
    return details;
};

const getNodeTabHardwareDetails = (NodeDetails: CBNode | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (NodeDetails === undefined) {
        return details;
    }
    details.push({
        key: Constants.TOTAL_MEMORY,
        value: NodeDetails.memoryTotal?.toString() || "NA"
    });

    // Free Memory
    details.push({
        key: Constants.FREE_MEMORY,
        value: NodeDetails.memoryFree?.toString() || "NA"
    });

    // Reserved MCD Memory
    details.push({
        key: Constants.RESERVED_MCDMEMORY,
        value: NodeDetails.mcdMemoryReserved?.toString() || "NA"
    });

    // Allocated MCD Memory
    details.push({
        key: Constants.ALLOCATED_MCDMEMORY,
        value: NodeDetails.mcdMemoryAllocated?.toString() || "NA"
    });

    // CPUs
    details.push({
        key: Constants.CPUS,
        value: NodeDetails.cpuCount?.toString() || "NA"
    });

    return details;

};

const getNodeTabSystemStatsDetails = (NodeDetails: CBNode | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (NodeDetails === undefined) {
        return details;
    }
    details.push({
        key: Constants.CPU_UTILIZATION_RATE,
        value: NodeDetails.systemStats?.cpu_utilization_rate?.toString() || "NA"
    });

    // Swap Total
    details.push({
        key: Constants.SWAP_TOTAL,
        value: NodeDetails.systemStats?.swap_total?.toString() || "NA"
    });

    // Total Memory
    details.push({
        key: Constants.TOTAL_MEMORY,
        value: NodeDetails.systemStats?.mem_total?.toString() || "NA"
    });

    // Memory Limit
    details.push({
        key: Constants.MEMORY_LIMIT,
        value: NodeDetails.systemStats?.mem_limit?.toString() || "NA"
    });

    // CPU Stole Rate
    details.push({
        key: Constants.CPU_STOLE_RATE,
        value: NodeDetails.systemStats?.cpu_stolen_rate?.toString() || "NA"
    });

    // Swap Used
    details.push({
        key: Constants.SWAP_USED,
        value: NodeDetails.systemStats?.swap_used?.toString() || "NA"
    });

    // Free Memory
    details.push({
        key: Constants.FREE_MEMORY,
        value: NodeDetails.systemStats?.mem_free?.toString() || "NA"
    });

    // Cores Available
    details.push({
        key: Constants.CORES_AVAILABLE,
        value: NodeDetails.systemStats?.cpu_cores_available?.toString() || "NA"
    });
    return details;
};

const getNodeTabInterestingStatsDetails = (NodeDetails: CBNode | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (NodeDetails === undefined) {
        return details;
    }
    // Documents Data Size
    details.push({
        key: Constants.DOCUMENTS_DATA_SIZE,
        value: NodeDetails.interestingStats?.couch_docs_data_size.toString() || "NA"
    });

    // Documents Data Size on Disk
    details.push({
        key: Constants.DOCUMENTS_DATA_SIZE_ON_DISK,
        value: NodeDetails.interestingStats?.couch_docs_actual_disk_size.toString() || "NA"
    });

    // Spatial Data Size
    details.push({
        key: Constants.SPATIAL_DATA_SIZE,
        value: NodeDetails.interestingStats?.couch_spatial_data_size?.toString() || "NA"
    });

    // Spatial Data Size on Disk
    details.push({
        key: Constants.SPATIAL_DATA_SIZE_ON_DISK,
        value: NodeDetails.interestingStats?.couch_spatial_disk_size?.toString() || "NA"
    });

    // Views Data Size
    details.push({
        key: Constants.VIEWS_DATA_SIZE,
        value: NodeDetails.interestingStats?.couch_views_data_size?.toString() || "NA"
    });

    // Views Data Size on Disk
    details.push({
        key: Constants.VIEWS_DATA_SIZE_ON_DISK,
        value: NodeDetails.interestingStats?.couch_views_actual_disk_size?.toString() || "NA"
    });

    // Items
    details.push({
        key: Constants.ITEMS,
        value: NodeDetails.interestingStats?.curr_items?.toString() || "NA"
    });

    // Total Items
    details.push({
        key: Constants.TOTAL_ITEMS,
        value: NodeDetails.interestingStats?.curr_items_tot?.toString() || "NA"
    });

    // Ep. Bg. Fetched
    details.push({
        key: Constants.EP_BG_FETCHED,
        value: NodeDetails.interestingStats?.ep_bg_fetched?.toString() || "NA"
    });

    // Hits
    details.push({
        key: Constants.HITS,
        value: NodeDetails.interestingStats?.get_hits?.toString() || "NA"
    });

    // Index Data Size
    details.push({
        key: Constants.INDEX_DATA_SIZE,
        value: NodeDetails.interestingStats?.index_data_size?.toString() || "NA"
    });

    // Index Data Size on Disk
    details.push({
        key: Constants.INDEX_DATA_SIZE_ON_DISK,
        value: NodeDetails.interestingStats?.index_disk_size?.toString() || "NA"
    });

    // Memory Used
    details.push({
        key: Constants.MEMORY_USED,
        value: NodeDetails.interestingStats?.mem_used?.toString() || "NA"
    });

    // Ops
    details.push({
        key: Constants.OPS,
        value: NodeDetails.interestingStats?.ops?.toString() || "NA"
    });

    // # vBucket Non Resident
    details.push({
        key: Constants.NUM_ACTIVE_VBUCKET_NR,
        value: NodeDetails.interestingStats?.vb_replica_curr_items?.toString() || "NA"
    });

    // Current vBucket Replica Items
    details.push({
        key: Constants.CURRENT_VBUCKET_REPLICA_ITEMS,
        value: NodeDetails.interestingStats?.vb_replica_curr_items?.toString() || "NA"
    });

    return details;
};

const getBucketTabDetails = (bucketSettings: BucketOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (bucketSettings === undefined) {
        return details;
    }

    // Type
    details.push({
        key: Constants.TYPE,
        value: bucketSettings?.bucketType || "NA",
    });

    // Storage Backend
    details.push({
        key: Constants.STORAGE_BACKEND,
        value: bucketSettings?.storageBackend || "NA",
    });

    // Replicas
    details.push({
        key: Constants.REPLICAS,
        value: bucketSettings?.replicaNumber?.toString() || "NA",
    });

    // Eviction Policy
    details.push({
        key: Constants.EVICTION_POLICY,
        value: bucketSettings?.evictionPolicy || "NA",
    });

    // Durabiity Level
    details.push({
        key: Constants.DURABILITY_LEVEL,
        value: bucketSettings?.durabilityMinLevel?.toString() || "NA",
    });

    // Max TTL
    details.push({
        key: Constants.MAX_TTL,
        value: bucketSettings?.maxTTL?.toString() || "NA",
    });

    // Compression Mode
    details.push({
        key: Constants.COMPRESSION_MODE,
        value: bucketSettings?.compressionMode || "NA",
    });

    // Conflict Resolution
    details.push({
        key: Constants.CONFLICT_RESOLUTION,
        value: bucketSettings?.conflictResolutionType || "NA",
    });

    return details;
};

const getBucketTabQuotaDetails = (bucketSettings: BucketOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (bucketSettings === undefined) {
        return details;
    }

    // RAM
    details.push({
        key: Constants.RAM,
        value: bucketSettings?.quota?.ram?.toString() || "NA",
    });

    // Raw RAM
    details.push({
        key: Constants.RAW_RAM,
        value: bucketSettings?.quota?.rawRAM?.toString() || "NA",
    });
    return details;
};

const getBucketTabStatsDetails = (bucketSettings: BucketOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (bucketSettings === undefined) {
        return details;
    }

    // Ops Per Sec
    details.push({
        key: Constants.OPS_PER_SEC,
        value: bucketSettings?.basicStats?.opsPerSec?.toString() || "NA",
    });

    // Disk Fetches
    details.push({
        key: Constants.DISK_FETCHES,
        value: bucketSettings?.basicStats?.diskFetches?.toString() || "NA",
    });

    // Disk Used
    details.push({
        key: Constants.DISK_USED,
        value: bucketSettings?.basicStats?.diskUsed?.toString() || "NA",
    });

    // Memory Used
    details.push({
        key: Constants.MEMORY_USED,
        value: bucketSettings?.basicStats?.memUsed?.toString() || "NA",
    });

    // Item Count
    details.push({
        key: Constants.ITEM_COUNT,
        value: bucketSettings?.basicStats?.itemCount?.toString() || "NA",
    });

    // No of active vBucket Non Resident
    details.push({
        key: Constants.NUM_ACTIVE_VBUCKET_NR,
        value: bucketSettings?.basicStats?.vbActiveNumNonResident?.toString() || "NA",
    });

    // Data Used
    details.push({
        key: Constants.DATA_USED,
        value: bucketSettings?.basicStats?.dataUsed?.toString() || "NA",
    });

    return details;
};

const getGeneralClusterDetails = (serverOverview: ServerOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (serverOverview === undefined) {
        return details;
    }
    // Couchbase version
    details.push({
        key: Constants.COUCHBASEVERSIONKEY,
        value: (serverOverview.getNodes()[0]).version || "NA"
    });

    // Status
    details.push({
        key: Constants.STATUS,
        value: serverOverview.getNodes()[0].status || "NA"
    });

    // Services
    details.push({
        key: Constants.SERVICES,
        value: serverOverview.getNodes()[0].services.join(', ').toString() || "NA"
    });

    // Nodes
    details.push({
        key: Constants.NODES,
        value: serverOverview.getNodes().length.toString() || "NA"
    });

    // Buckets
    details.push({
        key: Constants.BUCKETS,
        value: serverOverview.getBucketNames().length.toString() || "NA"
    });

    details.push({
        key: Constants.OS,
        value: serverOverview.getNodes()[0].os || "NA"
    });
    return details;
};

const getGeneralQuotaDetails = (serverOverview: ServerOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (serverOverview === undefined) {
        return details;
    }
    // Data
    details.push({
        key: Constants.DATA,
        value: serverOverview?.getMemoryQuota()?.toString() || "NA"
    });

    // Eventing
    details.push({
        key: Constants.EVENTING,
        value: serverOverview?.getEventingMemoryQuota()?.toString() || "NA"
    });

    // Index
    details.push({
        key: Constants.INDEX,
        value: serverOverview?.getIndexMemoryQuota()?.toString() || "NA"
    });

    // Analytics
    details.push({
        key: Constants.ANALYTICS,
        value: serverOverview?.getCbasMemoryQuota()?.toString() || "NA"
    });

    // Search
    details.push({
        key: Constants.SEARCH,
        value: serverOverview?.getFtsMemoryQuota()?.toString() || "NA"
    });


    return details;
};

const getGeneralRAMDetails = (serverOverview: ServerOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (serverOverview === undefined) {
        return details;
    }

    let ram = serverOverview.getStorageTotals()?.ram;
    // Total
    details.push({
        key: Constants.TOTAL,
        value: ram?.total?.toString() || "NA"
    });

    // Used
    details.push({
        key: Constants.USED,
        value: ram?.used?.toString() || "NA"
    });

    // Quota Total
    details.push({
        key: Constants.QUOTA_TOTAL,
        value: ram?.quotaTotal?.toString() || "NA"
    });

    // Quota Used
    details.push({
        key: Constants.QUOTA_USED,
        value: ram?.quotaUsed?.toString() || "NA"
    });

    // Quota Used per node
    details.push({
        key: Constants.QUOTA_USED_PER_NODE,
        value: ram?.quotaUsedPerNode?.toString() || "NA"
    });

    // Quota Total per node
    details.push({
        key: Constants.USED,
        value: ram?.quotaTotalPerNode?.toString() || "NA"
    });

    // Used by Data
    details.push({
        key: Constants.USED_BY_DATA,
        value: ram?.usedByData?.toString() || "NA"
    });
    return details;
};

const getGeneraStorageDetails = (serverOverview: ServerOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (serverOverview === undefined) {
        return details;
    }

    let hdd = serverOverview.getStorageTotals()?.hdd;

    // Total
    details.push({
        key: Constants.TOTAL,
        value: hdd?.total?.toString() || "NA"
    });

    // Used
    details.push({
        key: Constants.USED,
        value: hdd?.used?.toString() || "NA"
    });

    // Quota Total
    details.push({
        key: Constants.QUOTA_TOTAL,
        value: hdd?.quotaTotal?.toString() || "NA"
    });

    // Used by Data
    details.push({
        key: Constants.USED_BY_DATA,
        value: hdd?.usedByData?.toString() || "NA"
    });

    // Free
    details.push({
        key: Constants.FREE,
        value: hdd?.free?.toString() || "NA"
    });

    return details;
};

const fetchBucketNames = (bucketsSettings: BucketSettings[] | undefined, connection: IConnection): Array<Bucket> => {
    let Buckets: Array<Bucket> = [];
    if (bucketsSettings !== undefined) {
        for (let bucketSettings of bucketsSettings) {
            let bucketName: string = bucketSettings.name;
            let bucket: Bucket | undefined = connection?.cluster?.bucket(bucketName);
            if (bucket !== undefined) {
                Buckets.push(bucket);
            }
        }
    }
    return Buckets;
};

export async function fetchClusterOverview(node: ClusterConnectionNode, context: vscode.ExtensionContext) {
    const connection = Memory.state.get<IConnection>("activeConnection");

    if (!connection) {
        return;
    }

    const currentPanel = vscode.window.createWebviewPanel(
        "clusterOverview",
        "Cluster Overview",
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            enableForms: true,
        }
    );
    currentPanel.iconPath = vscode.Uri.file(
        path.join(__filename, "..", "..", "images", "cb-logo-icon.svg")
    );

    // Fetch server overview details
    const restAPIObject = new CouchbaseRestAPI(connection);
    const serverOverview: ServerOverview | undefined = await restAPIObject.getOverview();

    // Fetch Buckets
    let bucketsSettings = await connection?.cluster?.buckets().getAllBuckets();
    let Buckets = fetchBucketNames(bucketsSettings, connection);

    // General Overview
    let generalClusterDetails = getGeneralClusterDetails(serverOverview);
    let generalQuotaDetails = getGeneralQuotaDetails(serverOverview);
    let generalRAMDetails = getGeneralRAMDetails(serverOverview);
    let generalStorageDetails = getGeneraStorageDetails(serverOverview);

    // Buckets Data
    let bucketsHTML: IKeyValuePair[] = [];
    for (let bucket of Buckets) {
        const bucketOverview: BucketOverview | undefined = await restAPIObject.getBucketsOverview(bucket.name);
        let bucketTabDetails = getBucketTabDetails(bucketOverview);
        let bucketTabQuotaDetails = getBucketTabQuotaDetails(bucketOverview);
        let bucketTabStatsDetails = getBucketTabStatsDetails(bucketOverview);

        let bucketHTML = ` \
        <div class="bucket-general"> \
            ${bucketTabDetails?.map((kv) =>
        (`<div class="field"> \
                        <div class="field-label"> \
                            ${kv.key} \
                        </div> \
                        <div class="field-value"> \
                            ${kv.value} \
                        </div> \
                    </div> \
                    `)).join('')} \
        </div> \
        <div class="separator-container"> \
            <span class="separator-text">Quota</span> \
            <div class="separator"></div> \
        </div> \
        <div class="bucket-quota flex"> \
            ${bucketTabQuotaDetails.map((kv) =>
        (`<div class="field"> \
                    <div class="field-label"> \
                        ${kv.key} \
                    </div> \
                    <div class="field-value"> \
                        ${kv.value} \
                    </div> \
                </div> \
            `)).join('')} \
        </div> \
        <div class="separator-container"> \
            <span class="separator-text">Basic Stats</span> \
            <div class="separator"></div> \
        </div> \
        <div class="bucket-stats flex"> \
            ${bucketTabStatsDetails.map((kv) =>
        (`<div class="field"> \
                    <div class="field-label"> \
                        ${kv.key} \
                    </div> \
                    <div class="field-value"> \
                        ${kv.value} \
                    </div> \
                </div> \
            `)).join('')} \
        </div>
        `;
        bucketsHTML.push({ key: bucket.name, value: bucketHTML });
    }

    // Nodes Data
    let NodesHTML: IKeyValuePair[] = [];
    for (let node of serverOverview?.getNodes() || []) {
        let nodeTabDetails = getNodeTabDetails(node);
        let nodeTabHardwareDetails = getNodeTabHardwareDetails(node);
        let nodeTabSystemStatsDetails = getNodeTabSystemStatsDetails(node);
        let nodeTabInterestingStatsDetails = getNodeTabInterestingStatsDetails(node);
        let nodeHTML = ` \
        <div class="bucket-general"> \
            ${nodeTabDetails?.map((kv) =>
        (`<div class="field"> \
                        <div class="field-label"> \
                            ${kv.key} \
                        </div> \
                        <div class="field-value"> \
                            ${kv.value} \
                        </div> \
                    </div> \
                    `)).join('')} \
                </div> \
        </div> \
        <div class="separator-container"> \
            <span class="separator-text">Hardware</span> \
            <div class="separator"></div> \
        </div> \
        <div class="bucket-quota flex"> \
            ${nodeTabHardwareDetails.map((kv) =>
        (`<div class="field"> \
                    <div class="field-label"> \
                        ${kv.key} \
                    </div> \
                    <div class="field-value"> \
                        ${kv.value} \
                    </div> \
                </div> \
            `)).join('')} \
        </div> \
        <div class="separator-container"> \
            <span class="separator-text">System Stats</span> \
            <div class="separator"></div> \
        </div> \
        <div class="bucket-quota flex"> \
            ${nodeTabSystemStatsDetails.map((kv) =>
        (`<div class="field"> \
                    <div class="field-label"> \
                        ${kv.key} \
                    </div> \
                    <div class="field-value"> \
                        ${kv.value} \
                    </div> \
                </div> \
            `)).join('')} \
        </div> \
        <div class="separator-container"> \
            <span class="separator-text">Interesting Stats</span> \
            <div class="separator"></div> \
        </div> \
        <div class="bucket-quota flex"> \
            ${nodeTabInterestingStatsDetails.map((kv) =>
        (`<div class="field"> \
                    <div class="field-label"> \
                        ${kv.key} \
                    </div> \
                    <div class="field-value"> \
                        ${kv.value} \
                    </div> \
                </div> \
            `)).join('')} \
        </div> \
        `;
        NodesHTML.push({ key: node.hostname, value: nodeHTML });
    }


    const ClusterOverviewObject: IClusterOverview = {
        Buckets: Buckets,
        Nodes: serverOverview?.getNodes() || null,
        Title: "Cluster Overview",
        GeneralDetails: {
            Cluster: generalClusterDetails,
            Quota: generalQuotaDetails,
            Storage: generalStorageDetails,
            RAM: generalRAMDetails,
        },
        BucketsHTML: bucketsHTML,
        NodesHTML: NodesHTML,
    };
    try {
        const viewType = `${connection.url}.${node.id}`;
        currentPanel.webview.html = getClusterOverview(ClusterOverviewObject, context);
    } catch (err) {
        logger.error(`Failed to get Cluster Overview Information \`${node}\``);
        logger.debug(err);
    }
}
