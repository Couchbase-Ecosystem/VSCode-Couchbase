import * as vscode from 'vscode';
import { IConnection } from './IConnection';
import { INode } from './INode';
import { ENDPOINTS } from '../util/endpoints';
import get from "axios";
import { AxiosRequestConfig } from "axios";
import DocumentNode from './DocumentNode';

export default class CollectionNode implements INode{
    constructor(
      private readonly connection: IConnection,
        private readonly scopeName: string,
        private readonly bucketName: string,
        private readonly collectionName: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
      ) {}

      public getTreeItem(): vscode.TreeItem {
        return {
            label: `Collection:${this.collectionName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        };
    }

    public async getChildren(): Promise<INode[]> {

      try {
        const options: AxiosRequestConfig = {
          auth: {
            username: this.connection.username,
            password: this.connection.password ? this.connection.password : "",
          },
        };
  
        const documentResponse = await get(
          `${this.connection.url}${ENDPOINTS.GET_POOLS}/${this.bucketName}/scopes/${this.scopeName}/collections/${this.collectionName}/docs/`,
          options
        );

        let documentList: DocumentNode[] = [];
        documentResponse.data.rows.forEach((document: any) => {
          const documentTreeItem = new DocumentNode(
            document.id,
            vscode.TreeItemCollapsibleState.None
          );
          documentList.push(documentTreeItem);
        });
        return documentList;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      } 
    }
}