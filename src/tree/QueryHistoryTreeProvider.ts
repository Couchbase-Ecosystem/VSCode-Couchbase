import * as vscode from 'vscode';
import { IQuery } from '../types/IQuery';
import { getQueryHistory } from '../util/queryHistory';
import * as path from 'path';

export class QueryHistoryTreeProvider implements vscode.TreeDataProvider<IQuery> {
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
            }
        };
    }

    // Implement the required getChildren method to return child elements of a given element.
    getChildren(element?: IQuery): vscode.ProviderResult<IQuery[]> {
        return getQueryHistory();
    }
}
