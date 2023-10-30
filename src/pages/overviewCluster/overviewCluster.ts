import * as vscode from "vscode";
import * as path from "path";
import { getClusterOverview } from "../../webViews/clusterOverview.webview";
import { ClusterConnectionNode } from "../../model/ClusterConnectionNode";
import { Memory } from "../../util/util";
import { logger } from "../../logger/logger";
import { Constants } from "../../util/constants";
import { getClusterOverviewData } from "../../util/OverviewClusterUtils/getOverviewClusterData";
import { getLoader } from "../../webViews/loader.webview";
import { getActiveConnection } from "../../util/connections";

export interface IClusterOverviewWebviewState {
    webviewPanel: vscode.WebviewPanel
}

export async function fetchClusterOverview(node: ClusterConnectionNode, refresh: boolean = false) {
    const connection = getActiveConnection();
    if (!connection) {
        return;
    }
    const clusterOverviewWebviewDetails = Memory.state.get<IClusterOverviewWebviewState>(Constants.CLUSTER_OVERVIEW_WEBVIEW);
    if (clusterOverviewWebviewDetails) {
        // Cluster Overview Webview already exists, Closing existing and creating new
        try {
            clusterOverviewWebviewDetails.webviewPanel.dispose();
        } catch (e) {
            logger.error("Error while disposing cluster overview webview: " + e);
        }
        Memory.state.update(Constants.CLUSTER_OVERVIEW_WEBVIEW, null);
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
    Memory.state.update(Constants.CLUSTER_OVERVIEW_WEBVIEW, {
        webviewPanel: currentPanel
    });

    currentPanel.iconPath = vscode.Uri.file(
        path.join(__filename, "..", "..", "images", "cb-logo-icon.svg")
    );
    currentPanel.webview.html = getLoader("Cluster Overview");
    try {
        const clusterOverviewObject = await getClusterOverviewData(refresh);
        if(clusterOverviewObject instanceof Error){
            throw clusterOverviewObject;
        }
        currentPanel.webview.html = getClusterOverview(clusterOverviewObject);
    } catch (err) {
        logger.error(`Failed to get Cluster Overview Information \`${node}\``);
        logger.debug(err);
        try {
            currentPanel.webview.html = `Failed to receive cluster overview Data; Please try again later`;
        } catch (e) {
            logger.debug("Cluster overview webview may have been already disposed: " + e);
        }
    }

    currentPanel.onDidDispose(() => {
        Memory.state.update(Constants.CLUSTER_OVERVIEW_WEBVIEW, null);
    });
}
