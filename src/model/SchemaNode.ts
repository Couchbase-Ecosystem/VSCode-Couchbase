import * as vscode from "vscode";
import * as path from "path";
import { IConnection } from "../types/IConnection";
import { INode } from "../types/INode";
import { logger } from "../logger/logger";



export default class SchemaNode implements INode {
    constructor(
      public readonly schemaName: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly children?: INode[],
      public limit: number = 10,
    ) {}
    public async getTreeItem(): Promise<vscode.TreeItem> {
        return {
            label: `${this.schemaName}`,
            collapsibleState: this.collapsibleState,
            contextValue: "schema",
            command: undefined,
        };
    }

    public async getChildren(): Promise<INode[]> {
        return this.children ? this.children : [];
    }

    
}