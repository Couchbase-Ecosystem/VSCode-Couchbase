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
import * as vscode from 'vscode';
import get from "axios";
import { ENDPOINTS } from './endpoints';
import { AxiosRequestConfig } from "axios";
import DocumentNode from '../model/DocumentNode';
import { MemFS } from './fileSystemProvider';



export async function getDocument(documentNode: DocumentNode) {
  let uri: string;
  try {
    const options: AxiosRequestConfig = {
      auth: {
        username: documentNode.connection.username,
        password: documentNode.connection.password ? documentNode.connection.password : "",
      },
    };

    if(documentNode.isScopesandCollections){
      uri = `${documentNode.connection.url}${ENDPOINTS.GET_POOLS}/${documentNode.bucketName}/scopes/${documentNode.scopeName}/collections/${documentNode.collectionName}/docs/${documentNode.documentName}`;
    }
    else{
      uri = `${documentNode.connection.url}${ENDPOINTS.GET_POOLS}/${documentNode.bucketName}/docs/${documentNode.documentName}`;
    }

    const documentResponse = await get(
      uri,
      options
    );
    return documentResponse.data;
    } catch (err) {
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
        create: true, overwrite: true
      }
  );
  return filename;
}
