import * as vscode from 'vscode';
import * as path from 'path';
import { IConnection } from './IConnection';
import { INode } from './INode';
import { ENDPOINTS } from '../util/endpoints';
import get from "axios";
import { AxiosRequestConfig } from "axios";
import { ScopeNode } from './ScopeNode';
import DocumentNode from './DocumentNode';


export class BucketNode implements INode{
    constructor(
      private readonly connection: IConnection, 
      private readonly bucket: string, 
      private readonly isScopesandCollections: boolean, 
      public readonly collapsibleState: vscode.TreeItemCollapsibleState
      ) {}


      public getTreeItem(): vscode.TreeItem {
        return {
            label: `Bucket:${this.bucket}`,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "database",
            iconPath: path.join(__filename, "..", "..", "..", "media", "schema.gif"),
        };
    }

    public async getChildren(): Promise<INode[]> {

      if(this.isScopesandCollections){
        try {
          const options: AxiosRequestConfig = {
            auth: {
              username: this.connection.username,
              password: this.connection.password ? this.connection.password : "",
            },
          };
    
          const scopeResponse = await get(
            `${this.connection.url}${ENDPOINTS.GET_POOLS}/${this.bucket}/scopes`,
            options
          );
  
          let scopeList: ScopeNode[] = [];
          scopeResponse.data.scopes.forEach((scope: any) => {
            const scopeTreeItem = new ScopeNode(
              this.connection,
              scope.name,
              this.bucket,
              scope.collections,
              vscode.TreeItemCollapsibleState.None
            );
            scopeList.push(scopeTreeItem);
          });
    
          return scopeList;
        } catch (err) {
          console.log(err);
          throw new Error(err);
        } 
      }

      try {
        const options: AxiosRequestConfig = {
          auth: {
            username: this.connection.username,
            password: this.connection.password ? this.connection.password : "",
          },
        };
  
        const documentResponse = await get(
          `${this.connection.url}${ENDPOINTS.GET_POOLS}/${this.bucket}/docs`,
          options
        );

        let documentList: DocumentNode[] = [];
        documentResponse.data.rows.forEach((document: any) => {
          const documentTreeItem = new DocumentNode(
            document.id,
            this.connection,
            '',
            this.bucket,
            '',
            this.isScopesandCollections,
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