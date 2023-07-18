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
import { BucketNode } from "../../model/BucketNode";
import { getBucketMetaDataView } from "../../webViews/metaData.webview";

export const getBucketMetaData = async (node: BucketNode, context: vscode.ExtensionContext) => {
    const connection = Memory.state.get<IConnection>("activeConnection");
    if (!connection) {
        return;
    }
    try {
        const viewType = `${connection.url}.${node.bucketName}`;
        const bucketData = await connection.cluster
            ?.buckets()
            .getBucket(node.bucketName);
        if (!bucketData) {
            return;
        }

        let currentPanel: vscode.WebviewPanel | undefined = vscode.window.createWebviewPanel(
            viewType,
            node.bucketName,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
            }
        );
        currentPanel.iconPath = {
            light: vscode.Uri.file(path.join(__filename, "..", "..", "images", "light", "bucket-icon.svg")),
            dark: vscode.Uri.file(path.join(__filename, "..", "..", "images", "dark", "bucket-icon.svg"))
        };
        currentPanel.webview.html = getBucketMetaDataView(bucketData);

        currentPanel.onDidDispose(
            () => {
                currentPanel = undefined;
            },
            undefined,
            context.subscriptions
        );
    } catch (err) {
        logger.error(
            `Bucket metadata retrieval failed for \`${node.bucketName}\``
        );
        logger.debug(err);
    }
};