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
import { updateDocumentToServer } from "../util/documentUtils/updateDocument";
import { IConnection } from "../types/IConnection";
import { IDocumentData } from "../types/IDocument";
import { MemFS } from "../util/fileSystemProvider";

/**
* Handles a save conflict for a TextDocument by showing a warning message to the user,
* offering the choice to either discard local changes and load the server version or
* overwrite the remote version with local changes.
*
* @param remoteDocument The current version of the document in the server
* @param document The TextDocument being saved
* @param activeConnection The active connection object
* @param documentInfo The information about the document being saved
*/
export const handleSaveTextDocumentConflict = async (
    remoteDocument: any,
    document: vscode.TextDocument,
    activeConnection: IConnection,
    documentInfo: IDocumentData,
    memFs: MemFS,
    uriToCasMap: Map<string, string>
) => {
    const answer = await vscode.window.showWarningMessage(
        "Conflict Alert: There is a conflict while trying to save this document, as it was also changed in the server. Would you like to load the server version or overwrite the remote version with your changes?",
        { modal: true },
        "Discard Local Changes and Load Server Version",
        "Overwrite Server Version with Local Changes"
    );
    if (answer === "Discard Local Changes and Load Server Version") {
        memFs.writeFile(
            document.uri,
            Buffer.from(JSON.stringify(remoteDocument?.content, null, 2)),
            { create: true, overwrite: true }
        );
        uriToCasMap.set(document.uri.toString(), remoteDocument.cas.toString());
    } else if (answer === "Overwrite Server Version with Local Changes") {
        const cas = await updateDocumentToServer(
            activeConnection,
            documentInfo,
            document
        );
        if (cas !== "") {
            vscode.window.setStatusBarMessage("Document saved", 2000);
            uriToCasMap.set(document.uri.toString(), cas);
        }
    }
};
