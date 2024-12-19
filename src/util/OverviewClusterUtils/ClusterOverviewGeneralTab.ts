/*
 *     Copyright 2011-2020 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { IKeyValuePair } from "../../types/IKeyValuePair";
import { fmtByte, formatServices, mbToGb } from "./OverviewClusterHelper";
import { ServerOverview } from "../apis/ServerOverview";
import { Constants } from "../constants";
import { IConnection } from "../../types/IConnection";

export const getGeneralClusterDetails = (serverOverview: ServerOverview | undefined, connectionUrl: string): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (serverOverview === undefined) {
        return details;
    }
    // Couchbase version
    details.push({
        key: Constants.COUCHBASEVERSIONKEY,
        value: (serverOverview.getNodes()[0]).version || "NA"
    });

    // Cluster Type (Capella or Self Managed)
    details.push({
        key: Constants.CLUSTERTYPE,
        value: connectionUrl.includes(".cloud.couchbase.com") ? "Capella" : "Self Managed" || "NA"
    });

    // Status
    details.push({
        key: Constants.STATUS,
        value: serverOverview.getNodes()[0].status || "NA"
    });

    // Services
    details.push({
        key: Constants.SERVICES,
        value: formatServices(
            Array.from(new Set(getServices(serverOverview)))
                .join(', ')
                .toString()
        ) || "NA"
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

export const getServices = (serverOverview: ServerOverview): string[] => {
    const nodes = serverOverview.getNodes();
    const allServices: string[] = [];

    nodes.forEach(node => {
        allServices.push(...node.services);
    });

    return allServices;
};

export const getGeneralQuotaDetails = (serverOverview: ServerOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (serverOverview === undefined) {
        return details;
    }
    // Data
    details.push({
        key: Constants.DATA,
        value: mbToGb(serverOverview?.getMemoryQuota() || -1)
    });

    // Eventing
    details.push({
        key: Constants.EVENTING,
        value: mbToGb(serverOverview?.getEventingMemoryQuota() || -1)
    });

    // Index
    details.push({
        key: Constants.INDEX,
        value: mbToGb(serverOverview?.getIndexMemoryQuota() || -1),
    });

    // Analytics
    details.push({
        key: Constants.ANALYTICS,
        value: mbToGb(serverOverview?.getCbasMemoryQuota() || -1),
    });

    // Search
    details.push({
        key: Constants.SEARCH,
        value: mbToGb(serverOverview?.getFtsMemoryQuota() || -1),
    });
    return details;

};

export const getGeneralRAMDetails = (serverOverview: ServerOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (serverOverview === undefined) {
        return details;
    }

    let ram = serverOverview.getStorageTotals()?.ram;
    // Total
    details.push({
        key: Constants.TOTAL,
        value: fmtByte(ram?.total || -1)
    });

    // Used
    details.push({
        key: Constants.USED,
        value: fmtByte(ram?.used || -1),
    });

    // Quota Total
    details.push({
        key: Constants.QUOTA_TOTAL,
        value: fmtByte(ram?.quotaTotal || -1),
    });

    // Quota Used
    details.push({
        key: Constants.QUOTA_USED,
        value: fmtByte(ram?.quotaUsed || -1),
    });

    // Quota Used per node
    details.push({
        key: Constants.QUOTA_USED_PER_NODE,
        value: fmtByte(ram?.quotaUsedPerNode || -1),
    });

    // Quota Total per node
    details.push({
        key: Constants.QUOTA_TOTAL_PER_NODE,
        value: fmtByte(ram?.quotaTotalPerNode || -1),
    });

    // Used by Data
    details.push({
        key: Constants.USED_BY_DATA,
        value: fmtByte(ram?.usedByData || -1),
    });
    return details;
};

export const getGeneraStorageDetails = (serverOverview: ServerOverview | undefined): IKeyValuePair[] => {
    let details: IKeyValuePair[] = [];
    if (serverOverview === undefined) {
        return details;
    }

    let hdd = serverOverview.getStorageTotals()?.hdd;

    // Total
    details.push({
        key: Constants.TOTAL,
        value: fmtByte(hdd?.total || -1)
    });

    // Used
    details.push({
        key: Constants.USED,
        value: fmtByte(hdd?.used || -1),
    });

    // Quota Total
    details.push({
        key: Constants.QUOTA_TOTAL,
        value: fmtByte(hdd?.quotaTotal || -1),
    });

    // Used by Data
    details.push({
        key: Constants.USED_BY_DATA,
        value: fmtByte(hdd?.usedByData || -1),
    });

    // Free
    details.push({
        key: Constants.FREE,
        value: fmtByte(hdd?.free || -1),
    });

    return details;
};