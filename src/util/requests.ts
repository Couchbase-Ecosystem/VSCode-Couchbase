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
