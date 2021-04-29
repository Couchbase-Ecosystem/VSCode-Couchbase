import * as vscode from 'vscode';
import { INode } from './INode';

export default class DocumentNode extends vscode.TreeItem{
    constructor(
        private readonly documentName: string,
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
        };
    }

    public async getChildren(): Promise<INode[]> {
        return [];
    }
}