import * as vscode from 'vscode';
import * as path from 'path';
import { IConnection } from './IConnection';
import { INode } from './INode';
import { ENDPOINTS } from '../util/endpoints';
import get from "axios";
import { AxiosRequestConfig } from "axios";
import { ScopeNode } from './ScopeNode';


export class BucketNode implements INode{
    constructor(private readonly connection: IConnection, private readonly bucket: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {}


      public getTreeItem(): vscode.TreeItem {
        return {
            label: `Bucket:${this.bucket}`,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "database",
            iconPath: path.join(__filename, "..", "..", "..", "media", "schema.gif"),
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
}