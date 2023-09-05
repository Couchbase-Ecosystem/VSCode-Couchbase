import * as vscode from 'vscode';
import { IQuery } from '../types/IQuery';
import { getQueryHistory } from '../util/queryHistory';

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

    getTreeItem(element: IQuery): vscode.TreeItem {
        return {
            label: element.query,
            iconPath: new vscode.ThemeIcon("check"),
            command: {
                command: 'vscode-couchbase.applyQueryHistory',
                title: 'Apply Query History',
                arguments: [element]
            }
        };
    }

    getChildren(element?: IQuery): vscode.ProviderResult<IQuery[]> {
        return getQueryHistory();
    }
}