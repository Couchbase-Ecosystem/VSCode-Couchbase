import * as vscode from "vscode";
import { INode } from "../types/INode";
import * as path from "path";

export default class SearchIndexNode implements INode {
    constructor(
        public readonly searchIndexName: string,
        public readonly bucketName: string,
        public readonly scopeName: string,
        public readonly indexName: string,
    ) { }
    public async getTreeItem(): Promise<vscode.TreeItem> {
        return {
            label: `${this.searchIndexName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: "searchIndex",
            command: {
                command: "vscode-couchbase.openSearchIndex",
                title: "Open Search Index",
                arguments: [this],
              },
              iconPath: {
                light: path.join(
                  __filename,
                  "..",
                  "..",
                  "images/light",
                  "document.svg"
                ),
                dark: path.join(
                  __filename,
                  "..",
                  "..",
                  "images/dark",
                  "document.svg"
                ),
              },
        };
    }

    public async getChildren(): Promise<INode[]> {
        return [];
    }
}