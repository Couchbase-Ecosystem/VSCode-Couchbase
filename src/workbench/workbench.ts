import * as vscode from 'vscode';
import * as path from 'path';
import { logger } from '../logging/logger';
import { ClusterConnectionNode } from '../model/ClusterConnectionNode';
import { getWebviewContent } from '../webViews/workbench.webview';

export function openWorkbench(node: ClusterConnectionNode, context: vscode.ExtensionContext, currentPanel: vscode.WebviewPanel | undefined) {
    try {
        if (currentPanel && currentPanel.viewType === 'Workbench') {
            const reactAppPathOnDisk = vscode.Uri.file(
                path.join(context.extensionPath, "dist", "build.js")
            );
            const reactAppUri = currentPanel.webview.asWebviewUri(reactAppPathOnDisk);
            currentPanel.webview.html = getWebviewContent(reactAppUri, context);
            currentPanel.reveal(vscode.ViewColumn.One);
        } else {
            currentPanel = vscode.window.createWebviewPanel(
                'Workbench',
                'New Workbench',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [
                        vscode.Uri.file(path.join(context.extensionPath, "dist"))
                    ]
                }

            );
            const reactAppPathOnDisk = vscode.Uri.file(
                path.join(context.extensionPath, "dist", "build.js")
            );
            const reactAppUri = currentPanel.webview.asWebviewUri(reactAppPathOnDisk);

            currentPanel.webview.html = getWebviewContent(reactAppUri, context);

            currentPanel.onDidDispose(
                () => {
                    currentPanel = undefined;
                },
                undefined,
                context.subscriptions
            );
        }
    } catch (err) {
        logger.error("Failed to open Query Workbench");
        logger.debug(err);
    }
}