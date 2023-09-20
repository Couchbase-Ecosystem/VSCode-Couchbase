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
import { getActiveConnection } from "../util/connections";
import { extractDocumentInfo } from "../util/common";
import { getDocument } from "../util/documentUtils/getDocument";
import { DocumentNotFoundError } from "couchbase";
import { logger } from "../logger/logger";
import { updateDocumentToServer } from "../util/documentUtils/updateDocument";
import { MemFS } from "../util/fileSystemProvider";
import { handleSaveTextDocumentConflict } from "./handleSaveDocumentConflict";


export const handleOnSaveTextDocument = async (document: vscode.TextDocument, uriToCasMap: Map<string, string>, memFs: MemFS) => {
    const activeConnection = getActiveConnection();
    if (!activeConnection) {
        return;
    }
    const documentInfo = await extractDocumentInfo(document.uri.path);
    let remoteDocument = undefined;
    try {
        remoteDocument = await getDocument(activeConnection, documentInfo);
    }
    catch (err) {
        if (!(err instanceof DocumentNotFoundError)) {
            return;
        }
    }
    if (remoteDocument && remoteDocument.cas.toString() !== uriToCasMap.get(document.uri.toString())) {
        handleSaveTextDocumentConflict(remoteDocument, document, activeConnection, documentInfo, memFs, uriToCasMap);
    } else {
        const cas = await updateDocumentToServer(activeConnection, documentInfo, document);
        if (cas !== "") {
            vscode.window.setStatusBarMessage("Document saved", 2000);
            uriToCasMap.set(document.uri.toString(), cas);
        }
        vscode.window.setStatusBarMessage("Document saved", 2000);
        logger.info(`Document with id ${documentInfo.name} has been updated`);
        uriToCasMap.set(document.uri.toString(), cas);
    }
};
