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
import { IConnection } from "../../types/IConnection";
import { IDocumentData } from "../../types/IDocument";

export const updateDocumentToServer = async (
  activeConnection: IConnection,
  documentInfo: IDocumentData,
  document: vscode.TextDocument
): Promise<string> => {
  const result = await activeConnection.cluster
    ?.bucket(documentInfo.bucket)
    .scope(documentInfo.scope)
    .collection(documentInfo.collection)
    .upsert(documentInfo.name, JSON.parse(document.getText()));
  vscode.window.setStatusBarMessage("Document saved", 2000);
  if (result && result.cas) {
    return result.cas.toString();
  }
  return "";
};
