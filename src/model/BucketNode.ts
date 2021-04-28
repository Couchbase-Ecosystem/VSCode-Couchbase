import * as vscode from 'vscode';
import * as path from 'path';
import * as http from 'http';
import { IConnection } from './IConnection';
import { INode } from './INode';
import { ENDPOINTS } from '../util/endpoints';


export class BucketNode extends vscode.TreeItem{
    constructor(
        private readonly connection: IConnection,
        private readonly bucket: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
      ) {
        super(bucket, collapsibleState);
        this.tooltip = `${bucket}`;
        this.description = "Bucket";
      }


      public getTreeItem(): vscode.TreeItem {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "database",
            iconPath: path.join(__filename, "..", "..", "..", "media", "schema.gif"),
        };
    }

    public async getChildren(): Promise<INode[]> {
    
        return Promise.resolve([]);
        
      }
}