import * as vscode from 'vscode';
import { IQuery } from '../types/IQuery';
import { getQueryHistory } from '../util/queryHistory';
import * as path from 'path';
import { Memory } from '../util/util';
import { IConnection } from '../types/IConnection';
import { QueryWorkbench } from '../workbench/queryWorkbench';
import { MemFS } from '../util/fileSystemProvider';
import { Commands } from '../commands/extensionCommands/commands';

export class QueryHistoryTreeProvider implements vscode.TreeDataProvider<IQuery> {
    private _onDidChangeTreeData: vscode.EventEmitter<
    IQuery | undefined | null | void
    > = new vscode.EventEmitter<IQuery | undefined | null | void>();

    readonly onDidChangeTreeData: vscode.Event<IQuery | undefined | null | void> = this._onDidChangeTreeData.event;    
    
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    constructor(private readonly context: vscode.ExtensionContext) {
    }

    // Implement the required getTreeItem method to return a TreeItem for a given element.
    getTreeItem(element: IQuery): vscode.TreeItem {
        return {
            label: element.query,
            iconPath: {
                light: path.join(
                    __filename,
                    "..",
                    "..",
                    "images/light",
                    "checkmark.svg"
                ),
                dark: path.join(
                    __filename,
                    "..",
                    "..",
                    "images/dark",
                    "checkmark.svg"
                )
            },
            command: {
                command: 'vscode-couchbase.applyQueryHistory',
                title: 'Apply Query History',
                arguments: [element] // Pass the item as an argument to the command
            }
        };
    }

    // Implement the required getChildren method to return child elements of a given element.
    getChildren(element?: IQuery): vscode.ProviderResult<IQuery[]> {
        return getQueryHistory();
    }
}

