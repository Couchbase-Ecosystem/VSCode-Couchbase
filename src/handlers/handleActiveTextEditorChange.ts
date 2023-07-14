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
import { handleActiveEditorConflict } from "./handleActiveEditorConflict";
import { getActiveConnection } from "../util/connections";
import { IDocumentData } from "../types/IDocument";
import { extractDocumentInfo } from "../util/common";
import { getDocument } from "../util/documentUtils/getDocument";
import { DocumentNotFoundError } from "couchbase";
import { logger } from "../logger/logger";

export const handleActiveEditorChange = async (editor: vscode.TextEditor, uriToCasMap: Map<string, string>, memFs: MemFS) => {
    if (
        editor.document.languageId === "json" &&
        editor.document.uri.scheme === "couchbase"
    ) {
        const activeConnection = getActiveConnection();
        if (!activeConnection) {
            return;
        }
        const documentInfo: IDocumentData = extractDocumentInfo(
            editor.document.uri.path
        );
        try {
            const remoteDocument = await getDocument(
                activeConnection,
                documentInfo
            );
            // The condition below is checking whether the remoteDocument object exists and whether there is
            // a Cas value associated with the URI. Furthermore, it's verifying whether the Cas value
            // in the remoteDocument has been modified since the last time it was saved.
            if (
                remoteDocument &&
                uriToCasMap.get(editor.document.uri.toString()) &&
                remoteDocument.cas.toString() !==
                uriToCasMap.get(editor.document.uri.toString())
            ) {
                await handleActiveEditorConflict(editor.document, remoteDocument, memFs, uriToCasMap);
            }
        } catch (err) {
            if (err instanceof DocumentNotFoundError) {
                return;
            }
            logger.error(err);
        }
    }
};