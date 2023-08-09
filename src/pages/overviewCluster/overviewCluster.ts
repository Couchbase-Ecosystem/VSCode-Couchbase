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
import { fmtByte, formatServices, mbToGb } from "../../util/OverviewClusterUtils/OverviewClusterHelper";
import { getNodeTabData } from "../../util/OverviewClusterUtils/ClusterOverviewNodeTab";
import { getBucketData } from "../../util/OverviewClusterUtils/ClusterOverviewBucketTab";
import { getGeneraStorageDetails, getGeneralClusterDetails, getGeneralQuotaDetails, getGeneralRAMDetails } from "../../util/OverviewClusterUtils/ClusterOverviewGeneralTab";

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
    currentPanel.webview.html = `Loading....`;
    let ClusterOverviewObject: IClusterOverview = {
        GeneralDetails: null,
        Buckets: null,
        Nodes: null,
        Title: '',
        BucketsHTML: [],
        NodesHTML: []
    };

    try {
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
            let bucketHTML = bucketOverview !== undefined ? getBucketData(bucketOverview) : '';
            bucketsHTML.push({ key: bucket.name, value: bucketHTML });
        }

        // Nodes Data
        const NodesHTML: IKeyValuePair[] = serverOverview !== undefined ? getNodeTabData(serverOverview) : [];

        ClusterOverviewObject = {
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
    } catch (err) {
        logger.error("Failed to get Cluster Overview Data, error: " + err);
        currentPanel.webview.html = `Error while loading cluster, Please try again later!`;
    }
    try {
        const viewType = `${connection.url}.${node.id}`;
        const onDiskPath = vscode.Uri.file(path.join(context.extensionPath, 'src/webviews/styles/clusterOverview.css'));
        const styleSrc = currentPanel.webview.asWebviewUri(onDiskPath);
        currentPanel.webview.html = getClusterOverview(ClusterOverviewObject, context, styleSrc);

    } catch (err) {
        logger.error(`Failed to get Cluster Overview Information \`${node}\``);
        logger.debug(err);
    }
}
