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
import { DocumentNotFoundError } from "couchbase/dist/errors";
import { logger } from "../../logger/logger";
import { MemFS } from "../../util/fileSystemProvider";
import { Memory } from "../../util/util";
import { IConnection } from "../../types/IConnection";
import { IDocumentData } from "../../types/IDocument";
import { getDocument } from "../../util/documentUtils/getDocument";
import CollectionNode from "../../model/CollectionNode";

export const searchDocument = async (node: CollectionNode, uriToCasMap: Map<string, string>, memFs: MemFS) => {
    const connection = Memory.state.get<IConnection>("activeConnection");
    if (!connection) {
        return;
    }
    const documentName = await vscode.window.showInputBox({
        prompt: "Please enter the Document ID",
        placeHolder: "Document Id",
        ignoreFocusOut: true,
        value: "",
    });
    if (!documentName) {
        vscode.window.showErrorMessage("Document Id is required.");
        return;
    }
    try {
        const documentInfo: IDocumentData = {
            bucket: node.bucketName,
            scope: node.scopeName,
            collection: node.collectionName,
            name: documentName
        };
        const result = await getDocument(connection, documentInfo);
        const uri = vscode.Uri.parse(
            `couchbase:/${node.bucketName}/${node.scopeName}/Collections/${node.collectionName}/${documentName}.json`
        );
        if (result) {
            uriToCasMap.set(uri.toString(), result.cas.toString());
        }
        memFs.writeFile(
            uri,
            Buffer.from(JSON.stringify(result?.content, null, 2)),
            { create: true, overwrite: true }
        );
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document, { preview: false });
        return true;
    } catch (err) {
        if (err instanceof DocumentNotFoundError) {
            vscode.window.showErrorMessage(
                `The document with document Id ${documentName} does not exist`,
                { modal: true }
            );
            logger.info(`The document with document Id ${documentName} does not exist`);
        } else {
            logger.error(
                `An error occured while retrieving document with document Id ${documentName}`
            );
            logger.debug(err);
        }
    }
};