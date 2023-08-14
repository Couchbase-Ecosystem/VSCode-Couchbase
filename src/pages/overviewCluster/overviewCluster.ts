import * as vscode from "vscode";
import * as path from "path";
import { getClusterOverview } from "../../webViews/clusterOverview.webview";
import { ClusterConnectionNode } from "../../model/ClusterConnectionNode";
import { Memory } from "../../util/util";
import { IConnection } from "../../types/IConnection";
import { logger } from "../../logger/logger";
import { IClusterOverview } from "../../types/IClusterOverview";
import { Bucket, BucketSettings } from "couchbase";
import { CouchbaseRestAPI } from "../../util/apis/CouchbaseRestAPI";
import { ServerOverview } from "../../util/apis/ServerOverview";
import { IKeyValuePair } from "../../types/IKeyValuePair";
import { BucketOverview } from "../../util/apis/BucketOverview";
import { getNodeTabData } from "../../util/OverviewClusterUtils/ClusterOverviewNodeTab";
import { getBucketData } from "../../util/OverviewClusterUtils/ClusterOverviewBucketTab";
import { getGeneraStorageDetails, getGeneralClusterDetails, getGeneralQuotaDetails, getGeneralRAMDetails } from "../../util/OverviewClusterUtils/ClusterOverviewGeneralTab";

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
    currentPanel.webview.html = `<h1>Loading....</h1>`;
    let clusterOverviewObject: IClusterOverview = {
        generalDetails: null,
        buckets: null,
        nodes: null,
        title: '',
        bucketsHTML: [],
        nodesHTML: []
    };

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

        clusterOverviewObject = {
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
        };
    } catch (err) {
        logger.error("Failed to get Cluster Overview Data, error: " + err);
        currentPanel.webview.html = `<h1>Error!<h1>`;

        vscode.window.showErrorMessage("Error while loading cluster overview details, Please try again later!",{ modal: true });
    }
    try {
        const onDiskPath = vscode.Uri.file(path.join(context.extensionPath, 'src/webviews/styles/clusterOverview.css'));
        const styleSrc = currentPanel.webview.asWebviewUri(onDiskPath);
        currentPanel.webview.html = getClusterOverview(clusterOverviewObject, context, styleSrc);

    } catch (err) {
        logger.error(`Failed to get Cluster Overview Information \`${node}\``);
        logger.debug(err);
    }
}
