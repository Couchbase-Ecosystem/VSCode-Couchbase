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
import * as vscode from "vscode";
import * as path from "path";
import { IConnection } from "../../types/IConnection";
import { Memory } from "../../util/util";
import { logger } from "../../logger/logger";
import { getDocumentMetaDataView } from "../../webViews/metaData.webview";
import DocumentNode from "../../model/DocumentNode";
import { Constants } from "../../util/constants";
import { hasQueryService } from "../../util/common";
import { CouchbaseRestAPI } from "../../util/apis/CouchbaseRestAPI";

export const getDocumentMetaData = async (node: DocumentNode, context: vscode.ExtensionContext) => {
    const connection = Memory.state.get<IConnection>(Constants.ACTIVE_CONNECTION);
    if (!connection) {
        return;
    }
    try {
        let result;
        if (hasQueryService(connection.services)) {
            try {
                result = await connection.cluster?.query(
                    `SELECT META(b) as meta, XATTRS(b) as xattrs FROM \`${node.bucketName}\`.\`${node.scopeName}\`.\`${node.collectionName}\` b WHERE META(b).id = "${node.documentName}"`
                );
                result = result?.rows;
            } catch {
                const couchbaseRestAPI = new CouchbaseRestAPI(connection);
                result = await couchbaseRestAPI.getKVDocumentMetaData(node.bucketName, node.scopeName, node.collectionName, node.documentName);
            }
        } else {
            const couchbaseRestAPI = new CouchbaseRestAPI(connection);
            result = await couchbaseRestAPI.getKVDocumentMetaData(node.bucketName, node.scopeName, node.collectionName, node.documentName);
        }
        const viewType = `${connection.url}.${node.bucketName}.${node.scopeName}.${node.collectionName}.${node.documentName}`;
        let currentPanel: vscode.WebviewPanel | undefined = vscode.window.createWebviewPanel(
            viewType,
            node.documentName + '.metadata.json',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
            }
        );
        currentPanel.iconPath = {
            light: vscode.Uri.file(path.join(__filename, "..", "..", "images", "light", "document.svg")),
            dark: vscode.Uri.file(path.join(__filename, "..", "..", "images", "dark", "document.svg"))
        };
        currentPanel.webview.html = getDocumentMetaDataView(result);
        currentPanel.onDidDispose(
            () => {
                currentPanel = undefined;
            },
            undefined,
            context.subscriptions
        );
    } catch (err) {
        logger.error(
            `Document metadata retrieval failed for '${node.documentName}'`
        );
        logger.debug(err);
    }
};