import { IKeyValuePair } from "../../types/IKeyValuePair";
import { fmtByte, formatDuration, formatNumber, formatServices } from "./OverviewClusterHelper";
import { CBNode } from "../apis/CBNode";
import { ServerOverview } from "../apis/ServerOverview";
import { Constants } from "../constants";

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
        value: formatServices(NodeDetails.services.join(', ')) || "NA"
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
        value: formatDuration(parseInt(NodeDetails.uptime, 10)) || "NA"
    });
    return details;
};

const getNodeTabHardwareDetails = (NodeDetails: CBNode | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (NodeDetails === undefined) {
        return details;
    }
    // Total Memory
    details.push({
        key: Constants.TOTAL_MEMORY,
        value: fmtByte(NodeDetails.memoryTotal || -1)
    });

    // Free Memory
    details.push({
        key: Constants.FREE_MEMORY,
        value: fmtByte(NodeDetails.memoryFree || -1),
    });

    // Reserved MCD Memory
    details.push({
        key: Constants.RESERVED_MCDMEMORY,
        value: fmtByte(NodeDetails.mcdMemoryReserved || -1),
    });

    // Allocated MCD Memory
    details.push({
        key: Constants.ALLOCATED_MCDMEMORY,
        value: fmtByte(NodeDetails.mcdMemoryAllocated || -1),
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
        value: NodeDetails.systemStats?.cpu_utilization_rate?.toFixed(3).toString() || "NA"
    });

    // Swap Total
    details.push({
        key: Constants.SWAP_TOTAL,
        value: fmtByte(NodeDetails.systemStats?.swap_total || -1)
    });

    // Total Memory
    details.push({
        key: Constants.TOTAL_MEMORY,
        value: fmtByte(NodeDetails.systemStats?.mem_total || -1)
    });

    // Memory Limit
    details.push({
        key: Constants.MEMORY_LIMIT,
        value: fmtByte(NodeDetails.systemStats?.mem_limit || -1)
    });

    // CPU Stole Rate
    details.push({
        key: Constants.CPU_STOLE_RATE,
        value: NodeDetails.systemStats?.cpu_stolen_rate?.toFixed(3).toString() || "NA"
    });

    // Swap Used
    details.push({
        key: Constants.SWAP_USED,
        value: fmtByte(NodeDetails.systemStats?.swap_used || -1)
    });

    // Free Memory
    details.push({
        key: Constants.FREE_MEMORY,
        value: fmtByte(NodeDetails.systemStats?.mem_free || -1)
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
        value: fmtByte(NodeDetails.interestingStats?.couch_docs_data_size || -1),
    });

    // Documents Data Size on Disk
    details.push({
        key: Constants.DOCUMENTS_DATA_SIZE_ON_DISK,
        value: fmtByte(NodeDetails.interestingStats?.couch_docs_actual_disk_size || -1),
    });

    // Spatial Data Size
    details.push({
        key: Constants.SPATIAL_DATA_SIZE,
        value: fmtByte(NodeDetails.interestingStats?.couch_spatial_data_size || -1),
    });

    // Spatial Data Size on Disk
    details.push({
        key: Constants.SPATIAL_DATA_SIZE_ON_DISK,
        value: fmtByte(NodeDetails.interestingStats?.couch_spatial_disk_size || -1),
    });

    // Views Data Size
    details.push({
        key: Constants.VIEWS_DATA_SIZE,
        value: fmtByte(NodeDetails.interestingStats?.couch_views_data_size || -1),
    });

    // Views Data Size on Disk
    details.push({
        key: Constants.VIEWS_DATA_SIZE_ON_DISK,
        value: fmtByte(NodeDetails.interestingStats?.couch_views_actual_disk_size || -1),
    });

    // Items
    details.push({
        key: Constants.ITEMS,
        value: formatNumber(NodeDetails.interestingStats?.curr_items || -1)
    });

    // Total Items
    details.push({
        key: Constants.TOTAL_ITEMS,
        value: formatNumber(NodeDetails.interestingStats?.curr_items_tot || -1)
    });

    // Ep. Bg. Fetched
    details.push({
        key: Constants.EP_BG_FETCHED,
        value: NodeDetails.interestingStats?.ep_bg_fetched?.toString() || "NA"
    });

    // Hits
    details.push({
        key: Constants.HITS,
        value: NodeDetails.interestingStats?.get_hits?.toFixed(3).toString() || "NA"
    });

    // Index Data Size
    details.push({
        key: Constants.INDEX_DATA_SIZE,
        value: fmtByte(NodeDetails.interestingStats?.index_data_size || -1),
    });

    // Index Data Size on Disk
    details.push({
        key: Constants.INDEX_DATA_SIZE_ON_DISK,
        value: fmtByte(NodeDetails.interestingStats?.index_disk_size || -1),
    });

    // Memory Used
    details.push({
        key: Constants.MEMORY_USED,
        value: fmtByte(NodeDetails.interestingStats?.mem_used || -1),
    });

    // Ops
    details.push({
        key: Constants.OPS,
        value: NodeDetails.interestingStats?.ops?.toFixed(3).toString() || "NA"
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

const getNodeTabHtml = (nodeTabDetails: IKeyValuePair[], nodeTabHardwareDetails: IKeyValuePair[], nodeTabSystemStatsDetails: IKeyValuePair[], nodeTabInterestingStatsDetails: IKeyValuePair[]): string => {
    return `\
    <div class="bucket-general no-flex"> \
        ${nodeTabDetails?.map((kv) =>
    (`<div class="field"> \
                    <div class="field-label"> \
                        ${kv.key}: \
                    </div> \
                    <div class="field-value ${kv.key === Constants.STATUS && kv.value === 'healthy' ? 'status-node-value-green' : kv.key === Constants.STATUS && 'status-node-value-red'}"> \
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
                    ${kv.key}: \
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
                    ${kv.key}: \
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
                    ${kv.key}: \
                </div> \
                <div class="field-value"> \
                    ${kv.value} \
                </div> \
            </div> \
        `)).join('')} \
    </div> \
    `;
};

export const getNodeTabData = (serverOverview: ServerOverview): IKeyValuePair[] => {
    let NodesData: IKeyValuePair[] = [];
    for (let node of serverOverview?.getNodes() || []) {
        let nodeTabDetails = getNodeTabDetails(node);
        let nodeTabHardwareDetails = getNodeTabHardwareDetails(node);
        let nodeTabSystemStatsDetails = getNodeTabSystemStatsDetails(node);
        let nodeTabInterestingStatsDetails = getNodeTabInterestingStatsDetails(node);
        let nodeHTML = getNodeTabHtml(nodeTabDetails, nodeTabHardwareDetails, nodeTabSystemStatsDetails, nodeTabInterestingStatsDetails);
        NodesData.push({ key: node.hostname, value: nodeHTML });
    }
    return NodesData;
    
};