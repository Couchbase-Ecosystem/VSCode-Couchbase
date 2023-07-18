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
import DocumentNode from "../../model/DocumentNode";
import { logger } from "../../logger/logger";
import { MemFS } from "../../util/fileSystemProvider";
import { Memory } from "../../util/util";
import { IConnection } from "../../types/IConnection";

export const removeDocument = async (node: DocumentNode, uriToCasMap: Map<string, string>, memFs: MemFS) => {
    const connection = Memory.state.get<IConnection>("activeConnection");
    if (!connection) {
        return;
    }

    let answer = await vscode.window.showInformationMessage(
        `Are you sure you want to delete the document ${node.documentName}?`,
        ...["Yes", "No"]
    );
    if (answer !== "Yes") {
        return;
    }
    await connection.cluster
        ?.bucket(node.bucketName)
        .scope(node.scopeName)
        .collection(node.collectionName)
        .remove(node.documentName);
    try {
        const uri = vscode.Uri.parse(
            `couchbase:/${node.bucketName}/${node.scopeName}/Collections/${node.collectionName}/${node.documentName}.json`
        );
        memFs.delete(uri);
        uriToCasMap.delete(uri.toString());
    } catch (err) {
        if (!(err instanceof vscode.FileSystemError)) {
            logger.error(err);
        }
    }
    logger.info(`${node.bucketName}: ${node.scopeName}: ${node.collectionName}: The document named ${node.documentName} has been deleted`);
};