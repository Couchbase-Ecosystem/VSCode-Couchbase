import { IKeyValuePair } from "../../types/IKeyValuePair";
import { fmtByte, formatNumber } from "./OverviewClusterHelper";
import { BucketOverview } from "../apis/BucketOverview";

import { Constants } from "../constants";

const getBucketTabDetails = (bucketSettings: BucketOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (bucketSettings === undefined) {
        return details;
    }

    // Type
    details.push({
        key: Constants.TYPE,
        value: bucketSettings?.bucketType.replace("membase", "Couchbase") || "NA",
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
        value: fmtByte(bucketSettings?.quota?.ram || -1)
    });

    // Raw RAM
    details.push({
        key: Constants.RAW_RAM,
        value: fmtByte(bucketSettings?.quota?.rawRAM || -1)
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
        value: bucketSettings?.basicStats?.opsPerSec?.toFixed(3).toString() || "NA",
    });

    // Disk Fetches
    details.push({
        key: Constants.DISK_FETCHES,
        value: formatNumber(bucketSettings?.basicStats?.diskFetches || -1)
    });

    // Disk Used
    details.push({
        key: Constants.DISK_USED,
        value: fmtByte(bucketSettings?.basicStats?.diskUsed || -1)
    });

    // Memory Used
    details.push({
        key: Constants.MEMORY_USED,
        value: fmtByte(bucketSettings?.basicStats?.memUsed || -1)
    });

    // Item Count
    details.push({
        key: Constants.ITEM_COUNT,
        value: formatNumber(bucketSettings?.basicStats?.itemCount || -1)
    });

    // No of active vBucket Non Resident
    details.push({
        key: Constants.NUM_ACTIVE_VBUCKET_NR,
        value: bucketSettings?.basicStats?.vbActiveNumNonResident?.toString() || "NA",
    });

    // Data Used
    details.push({
        key: Constants.DATA_USED,
        value: fmtByte(bucketSettings?.basicStats?.dataUsed || -1)
    });

    return details;
};

const getBucketTabHtml = (bucketTabDetails: IKeyValuePair[], bucketTabQuotaDetails: IKeyValuePair[], bucketTabStatsDetails: IKeyValuePair[]): string => {
    return ` \
        <div class="bucket-general no-flex"> \
            ${bucketTabDetails?.map((kv) =>
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
            <span class="separator-text">Quota</span> \
            <div class="separator"></div> \
        </div> \
        <div class="bucket-quota flex"> \
            ${bucketTabQuotaDetails.map((kv) =>
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
            <span class="separator-text">Basic Stats</span> \
            <div class="separator"></div> \
        </div> \
        <div class="bucket-stats flex"> \
            ${bucketTabStatsDetails.map((kv) =>
    (`<div class="field"> \
                    <div class="field-label"> \
                        ${kv.key}: \
                    </div> \
                    <div class="field-value"> \
                        ${kv.value} \
                    </div> \
                </div> \
            `)).join('')} \
        </div>
        `;
};

export const getBucketData = (bucketOverview: BucketOverview): string => {
    let bucketTabDetails = getBucketTabDetails(bucketOverview);
    let bucketTabQuotaDetails = getBucketTabQuotaDetails(bucketOverview);
    let bucketTabStatsDetails = getBucketTabStatsDetails(bucketOverview);
    let bucketHTML = getBucketTabHtml(bucketTabDetails, bucketTabQuotaDetails, bucketTabStatsDetails);
    return bucketHTML;
};