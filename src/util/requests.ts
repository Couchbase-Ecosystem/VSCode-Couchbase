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
import DocumentNode from "../model/DocumentNode";
import { IConnection } from "../model/IConnection";
import { MemFS } from "./fileSystemProvider";

export async function getDocument(documentNode: DocumentNode) {
  try {
    const result = await documentNode.connection.cluster?.bucket(documentNode.bucketName).scope(documentNode.scopeName).collection(documentNode.collectionName).get(documentNode.documentName);
    return result?.content;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

export function saveDocumentToFileSystem(memFS: MemFS, document: any): string {
  const filename = `${document.meta.id}.json`;
  memFS.writeFile(
    vscode.Uri.parse(filename),
    Buffer.from(JSON.stringify(document.json, null, 2)),
    {
      create: true,
      overwrite: true,
    }
  );
  return filename;
}

export async function saveDocument(connection: IConnection, documentNode: vscode.TextDocument) {
  try {
    //TODO: how to get bucket, scope and collection?
    const bucketName = "test";
    const scopeName = "scope1";
    const collectionName = "collection1";
    const documentName = "mike1";
    await connection.cluster?.bucket(bucketName).scope(scopeName).collection(collectionName).upsert(documentName, JSON.parse(documentNode.getText()));
  } catch (err: any) {
    console.log(err);
    vscode.window.showErrorMessage(err.Message);
  }
}
