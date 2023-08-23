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

import * as vscode from 'vscode';
import * as path from 'path';
import { logger } from '../logger/logger';
import { ClusterConnectionNode } from '../model/ClusterConnectionNode';
import { getWebviewContent } from '../webViews/workbench.webview';
import { getActiveConnection } from '../util/connections';

export class QueryWorkbench {
    runCouchbaseQuery = async () => {
        const connection = getActiveConnection();
        if (!connection) {
            vscode.window.showInformationMessage("Kindly establish a connection with the cluster before executing query.");
            return false;
        }
        // Get the active text editor
        const activeTextEditor = vscode.window.activeTextEditor;
        if (
            activeTextEditor &&
            activeTextEditor.document.languageId === "SQL++"
        ) {
            // Get the text content of the active text editor.
            const query = activeTextEditor.document.getText();
            const result = await connection.cluster?.query(query);
            // Create and show a new webview
            const panel = vscode.window.createWebviewPanel(
                'queryResult', // Identifies the type of the webview. Used internally
                'Query Result', // Title of the panel displayed to the user
                { viewColumn: vscode.ViewColumn.Active, preserveFocus: true }, // Show the webview beside the current active editor and preserve focus
                {} // Webview options. More on these later.
            );
            panel.webview.html = `<h1>Query Result</h1><pre>${JSON.stringify(result, null, 2)}</pre>`;
        }
    };

    openWorkbench(node: ClusterConnectionNode, context: vscode.ExtensionContext, currentPanel: vscode.WebviewPanel | undefined) {
        try {
            if (currentPanel && currentPanel.viewType === 'Workbench') {
                const reactAppPathOnDisk = vscode.Uri.file(
                    path.join(context.extensionPath, "dist", "reactBuild.js")
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
                    path.join(context.extensionPath, "dist", "reactBuild.js")
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
    };
}