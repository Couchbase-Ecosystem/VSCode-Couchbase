import * as vscode from 'vscode';
import * as path from 'path';


export class ClusterTreeNode extends vscode.TreeItem {
    constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
      super(label, collapsibleState);
      this.tooltip = `${this.label}`;
      this.description = '';
    }
  
    // iconPath = {
    //   light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
  }
  