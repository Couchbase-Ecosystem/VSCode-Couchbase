import { BucketSettings, Bucket } from "couchbase";
import { logger } from "../../logger/logger";
import { IConnection } from "../../types/IConnection";
import { IKeyValuePair } from "../../types/IKeyValuePair";
import { BucketOverview } from "../apis/BucketOverview";
import { CouchbaseRestAPI } from "../apis/CouchbaseRestAPI";
import { ServerOverview } from "../apis/ServerOverview";
import { Constants } from "../constants";
import { Memory } from "../util";
import { getBucketData } from "./ClusterOverviewBucketTab";
import { getGeneralClusterDetails, getGeneralQuotaDetails, getGeneralRAMDetails, getGeneraStorageDetails } from "./ClusterOverviewGeneralTab";
import { getNodeTabData } from "./ClusterOverviewNodeTab";
import { IClusterOverview } from "../../types/IClusterOverview";

const fetchBucketNames = (bucketsSettings: BucketSettings[] | undefined, connection: IConnection): Array<Bucket> => {
    let allBuckets: Array<Bucket> = [];
    if (bucketsSettings !== undefined) {
        for (let bucketSettings of bucketsSettings) {
            let bucketName: string = bucketSettings.name;
            let bucket: Bucket | undefined = connection?.cluster?.bucket(bucketName);
            if (bucket !== undefined) {
                allBuckets.push(bucket);
            }
        }
    }
    return allBuckets;
};

export const getClusterOverviewData = async (refreshRequired:boolean = false):Promise<IClusterOverview> => {
    let clusterOverviewData:IClusterOverview = {
        generalDetails: null,
        buckets: null,
        nodes: null,
        title: '',
        bucketsHTML: [],
        nodesHTML: [],
        currentConnection: '',
    };
    const connection = Memory.state.get<IConnection>(Constants.ACTIVE_CONNECTION);
    if (!connection) {
        Memory.state.update(Constants.CLUSTER_OVERVIEW_DATA, clusterOverviewData);
        return clusterOverviewData;
    }

    
    if(!refreshRequired){ // If explicit refresh is not required, check for change in connection
        const currentClusterOverviewData = Memory.state.get<IClusterOverview>(Constants.CLUSTER_OVERVIEW_DATA);
        if(currentClusterOverviewData){
            if(currentClusterOverviewData.currentConnection === connection.connectionIdentifier){
                // No Refresh required case, returning old data;
                return currentClusterOverviewData;
            }
        }
    }
    
    try {
        // Fetch server overview details
        const restAPIObject = new CouchbaseRestAPI(connection);
        const serverOverview: ServerOverview | undefined = await restAPIObject.getOverview();

        // Fetch Buckets
        let bucketsSettings = await connection?.cluster?.buckets().getAllBuckets();
        let allBuckets = fetchBucketNames(bucketsSettings, connection);

        // General Overview
        let generalClusterDetails = getGeneralClusterDetails(serverOverview);
        let generalQuotaDetails = getGeneralQuotaDetails(serverOverview);
        let generalRAMDetails = getGeneralRAMDetails(serverOverview);
        let generalStorageDetails = getGeneraStorageDetails(serverOverview);

        // Buckets Data
        let bucketsHTML: IKeyValuePair[] = [];
        for (let bucket of allBuckets) {
            const bucketOverview: BucketOverview | undefined = await restAPIObject.getBucketsOverview(bucket.name);
            let bucketHTML = bucketOverview !== undefined ? getBucketData(bucketOverview) : '';
            bucketsHTML.push({ key: bucket.name, value: bucketHTML });
        }

        // Nodes Data
        const nodesHTML: IKeyValuePair[] = serverOverview !== undefined ? getNodeTabData(serverOverview) : [];

        clusterOverviewData = {
            buckets: allBuckets,
            nodes: serverOverview?.getNodes() || null,
            title: "Cluster Overview",
            generalDetails: {
                cluster: generalClusterDetails,
                quota: generalQuotaDetails,
                storage: generalStorageDetails,
                RAM: generalRAMDetails,
            },
            bucketsHTML: bucketsHTML,
            nodesHTML: nodesHTML,
            currentConnection: connection.connectionIdentifier,
        };
        Memory.state.update(Constants.CLUSTER_OVERVIEW_DATA, clusterOverviewData);
        return clusterOverviewData;
    } catch (err) {
        logger.error(`Failed to get Cluster Overview Data, error: ${err}`);
        Memory.state.update(Constants.CLUSTER_OVERVIEW_DATA, clusterOverviewData);
        return clusterOverviewData;
    }
};