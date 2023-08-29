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

export const applyQueryHistory = async (query: IQuery) => {
    const connection = Memory.state.get<IConnection>("activeConnection");
    if (!connection) {
        vscode.window.showErrorMessage("Please connect to a cluster from opening editor");
        return;
    }
    const activeTextEditor = vscode.window.activeTextEditor;
        if (
            activeTextEditor &&
            activeTextEditor.document.languageId === "SQL++"
        ){  
            activeTextEditor.edit((editBuilder)=>{
                editBuilder.replace(
                    new vscode.Range(0, 0, activeTextEditor.document.lineCount, 0),
                    query.query // Replace the entire content with the query
                );
            });
        } else {
            await vscode.commands.executeCommand(Commands.openQueryWorkbench);
            // Wait for editor to become active, If exceeds 3 seconds, then error is thrown
            let timeElapsed = 0; // in ms
            let timeInterval = 100; // in ms
            let totalTime = 3000; //in ms
            while (true) {
                await new Promise(resolve => setTimeout(resolve, timeInterval));

                let newActiveTextEditor = vscode.window.activeTextEditor;

                if (newActiveTextEditor && newActiveTextEditor.document.languageId === "SQL++") {
                    let lineCount = newActiveTextEditor.document.lineCount;
                    newActiveTextEditor.edit((editBuilder)=>{
                        editBuilder.replace(
                            new vscode.Range(0, 0, lineCount, 0),
                            query.query 
                        );
                    });
                    break;
                }

                timeElapsed += timeInterval;

                if (timeElapsed >= totalTime) {
                    vscode.window.showErrorMessage("Unable to open workbench with selected query");
                    return;
                }
            }
        }
};