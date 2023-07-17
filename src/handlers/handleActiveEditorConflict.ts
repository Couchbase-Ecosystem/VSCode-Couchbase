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
import { MemFS } from "../util/fileSystemProvider";

/**
* handleActiveEditorConflict function handles conflicts between the local version of an open document in Visual Studio Code
* and the server version of the same document. A modal dialog is displayed asking the user to load the server version or keep
* the local version.
*
* @param document vscode.TextDocument object representing the open document
* @param remoteDocument The updated version of the document from the server
*/
export const handleActiveEditorConflict = async (document: vscode.TextDocument, remoteDocument: any, memFs: MemFS, uriToCasMap: Map<string, string>) => {
    const answer = await vscode.window.showWarningMessage(
        "Conflict Alert: A change has been detected in the server version of this document. To ensure that you are working with the most up-to-date version, would you like to load the server version?",
        { modal: true },
        "Load Server Version",
        "Keep Local Version"
    );
    if (answer === "Load Server Version") {
        memFs.writeFile(
            document.uri,
            Buffer.from(JSON.stringify(remoteDocument?.content, null, 2)),
            { create: true, overwrite: true }
        );
        uriToCasMap.set(document.uri.toString(), remoteDocument.cas.toString());

    }
};