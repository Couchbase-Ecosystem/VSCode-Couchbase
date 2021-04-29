import * as vscode from 'vscode';
import { IConnection } from './IConnection';
import { INode } from './INode';
import { AxiosRequestConfig } from "axios";
import get from "axios";
import { ENDPOINTS } from '../util/endpoints';
import CollectionNode from './CollectionNode';


export class ScopeNode implements INode{
    constructor(
        private readonly connection: IConnection,
        private readonly scopeName: string,
        private readonly bucketName: string,
        private readonly collections: any[],
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
      ) {}
    
      public getTreeItem(): vscode.TreeItem {
        return {
            label: `Scope:${this.scopeName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "database",
        };
    }

    public async getChildren(): Promise<INode[]> {

        let collectionList: CollectionNode[] = [];
        this.collections.forEach((collection: any) => {
          const collectionTreeItem = new CollectionNode(
            this.connection,
            this.scopeName,
            this.bucketName,
            collection.name,
            vscode.TreeItemCollapsibleState.None
          );
          collectionList.push(collectionTreeItem);
        });
        return collectionList;
    }
}