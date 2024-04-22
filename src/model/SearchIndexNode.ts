import * as vscode from "vscode";
import { INode } from "../types/INode";

export default class SearchIndexNode implements INode {
    constructor(
        public readonly searchIndexName: string,
    ) { }
    public async getTreeItem(): Promise<vscode.TreeItem> {
        return {
            label: `${this.searchIndexName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: "searchIndex",
        };
    }

    public async getChildren(): Promise<INode[]> {
        return [];
    }
}