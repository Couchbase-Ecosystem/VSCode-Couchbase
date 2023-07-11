import * as vscode from 'vscode';
import * as path from 'path';
import { getClusterOverview } from '../../webViews/clusterOverview.webview';
import { ClusterConnectionNode } from '../../model/ClusterConnectionNode';
import { Memory } from '../../util/util';
import { IConnection } from '../../model/IConnection';
import * as keytar from "keytar";
import { Constants } from '../../util/constants';
import { getConnectionId } from '../../util/connections';
import axios from 'axios';
import { logger } from '../../logging/logger';

export async function fetchClusterOverview(node: ClusterConnectionNode) {
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
    currentPanel.iconPath = vscode.Uri.file(path.join(__filename, "..", "..", "images", "cb-logo-icon.svg"));

    try {
        const viewType = `${connection.url}.${node.id}`;
        currentPanel.webview.html = getClusterOverview('');

    } catch (err) {
        logger.error(
            `Failed to get Cluster Overview Information \`${node}\``
        );
        logger.debug(err);
    }
}