import * as vscode from "vscode";
import { INode } from "../types/INode";



export default class SchemaNode implements INode {
    constructor(
        public readonly schemaName: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly children?: INode[],
    ) { }
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