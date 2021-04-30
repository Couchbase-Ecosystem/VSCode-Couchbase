import * as vscode from 'vscode';
import * as http from 'http';
import get from "axios";
import { IConnection } from '../model/IConnection';import { ENDPOINTS } from './endpoints';
import { AxiosRequestConfig } from "axios";
import DocumentNode from '../model/DocumentNode';
import { MemFS } from './fileSystemProvider';



export async function getDocument(documentNode: DocumentNode) {
  try {
    const options: AxiosRequestConfig = {
      auth: {
        username: documentNode.connection.username,
        password: documentNode.connection.password ? documentNode.connection.password : "",
      },
    };

    const documentResponse = await get(
      `${documentNode.connection.url}${ENDPOINTS.GET_POOLS}/${documentNode.bucketName}/scopes/${documentNode.scopeName}/collections/${documentNode.collectionName}/docs/${documentNode.documentName}`,
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
