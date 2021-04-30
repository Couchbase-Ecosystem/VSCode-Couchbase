import * as vscode from 'vscode';
import { IConnection } from './IConnection';
import { INode } from './INode';

export default class DocumentNode extends vscode.TreeItem{
    constructor(
        public readonly documentName: string,
        public readonly connection: IConnection,
        public readonly scopeName: string,
        public readonly bucketName: string,
        public readonly collectionName: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
      ) {
        super(documentName, collapsibleState);
        this.tooltip = `${this.documentName}`;
        this.description = this.documentName;
      }

      public getTreeItem(): vscode.TreeItem {
        return {
            label: `Document:${this.documentName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: "document",
            command: {
              command: 'vscode-couchbase.openDocument',
              title: 'Open Document',
          }
        };
    }

    public async getChildren(): Promise<INode[]> {
        return [];
    }
}