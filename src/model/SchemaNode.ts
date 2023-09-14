import * as vscode from "vscode";
import * as path from "path";
import { IConnection } from "../types/IConnection";
import { INode } from "../types/INode";
import { logger } from "../logger/logger";



export default class SchemaNode implements INode {
    constructor(
      public readonly parentNode: INode,
      public readonly connection: IConnection,
      public readonly scopeName: string,
      public readonly bucketName: string,
      public readonly collectionName: string,
      public readonly schemaName: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly schemaProp: any,
      public limit: number = 10
    ) {}
    public async getTreeItem(): Promise<vscode.TreeItem> {
        return {
            label: `${this.schemaName}`,
            collapsibleState: this.collapsibleState,
            contextValue: "schemaDirectory",
        };
    }

    public async getChildren(): Promise<INode[]> {
        return [];
    }

    
}