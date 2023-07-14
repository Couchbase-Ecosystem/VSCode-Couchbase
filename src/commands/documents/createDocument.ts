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
import CollectionNode from "../../model/CollectionNode";
import { IConnection } from "../../types/IConnection";
import { Memory } from "../../util/util";
import { logger } from "../../logger/logger";
import { DocumentNotFoundError } from "couchbase";
import { MemFS } from "../../util/fileSystemProvider";

export const createDocument = async (node: CollectionNode, memFs: MemFS, uriToCasMap: Map<string, string>) => {
    const connection = Memory.state.get<IConnection>("activeConnection");
    if (!connection) {
        return;
    }

    const documentName = await vscode.window.showInputBox({
        prompt: "Document Id",
        placeHolder: "Document Id",
        ignoreFocusOut: true,
        value: "",
    });
    if (!documentName) {
        vscode.window.showErrorMessage("Document Id is required.");
        return;
    }

    const uri = vscode.Uri.parse(
        `couchbase:/${node.bucketName}/${node.scopeName}/Collections/${node.collectionName}/${documentName}.json`
    );
    let documentContent = Buffer.from("{}");
    // Try block is trying to retrieve the document with the same key first
    // If returns an error go to catch block create a new empty document
    try {
        const result = await node.connection.cluster
            ?.bucket(node.bucketName)
            .scope(node.scopeName)
            .collection(node.collectionName)
            .get(documentName);
        if (result) {
            uriToCasMap.set(uri.toString(), result.cas.toString());
        }
        documentContent = Buffer.from(
            JSON.stringify(result?.content, null, 2)
        );
    } catch (err: any) {
        if (!(err instanceof DocumentNotFoundError)) {
            logger.error(err);
        }
    }
    memFs.writeFile(uri, documentContent, {
        create: true,
        overwrite: true,
    });
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document, { preview: false });
    logger.info(`${node.bucketName}: ${node.scopeName}: ${node.collectionName}: Successfully created the document: ${documentName}`);
};
