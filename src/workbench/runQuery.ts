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
import UntitledSqlppDocumentService from './controller';

export class QueryWorkbench {
    private _untitledSqlppDocumentService: UntitledSqlppDocumentService;

    constructor() {
        this._untitledSqlppDocumentService = new UntitledSqlppDocumentService();
    }

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
            
            // // Create and show a new webview
            // const panel = vscode.window.createWebviewPanel(
            //     'queryResult', // Identifies the type of the webview. Used internally
            //     'Query Result', // Title of the panel displayed to the user
            //     { viewColumn: vscode.ViewColumn.Active, preserveFocus: true }, // Show the webview beside the current active editor and preserve focus
            //     {} // Webview options. More on these later.
            // );
            // panel.webview.html = `<h1>Query Result</h1><pre>${JSON.stringify(result, null, 2)}</pre>`;
        }
    };

    openWorkbench(node: ClusterConnectionNode, context: vscode.ExtensionContext, currentPanel: vscode.WebviewPanel | undefined) {
        this._untitledSqlppDocumentService.newQuery();
    };
}