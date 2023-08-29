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

export const applyQueryHistory = (query: IQuery) => {
    vscode.workspace.findFiles('**/*.sqlpp', '').then((uris) => {
        
        if (uris.length > 0) {
            // If there are .sqlpp files, open the first one found
            vscode.workspace.openTextDocument(uris[0]).then((document) => {
                vscode.window.showTextDocument(document);
                // Set the content of the opened document to the query
                vscode.window.activeTextEditor?.edit((editBuilder) => {
                    editBuilder.replace(
                        new vscode.Range(0, 0, document.lineCount, 0),
                        query.query // Replace the entire content with the query
                    );
                });
            });
        } else {
            // If no .sqlpp files found, open a new one and set the content
            vscode.workspace.openTextDocument({ language: 'sqlpp', content: query.query }).then((document) => {
                vscode.window.showTextDocument(document);
            });
        }
    });
};