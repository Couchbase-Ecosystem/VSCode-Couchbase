import * as vscode from 'vscode';
import { IQuery } from '../../types/IQuery';
import { Memory } from '../../util/util';
import { IConnection } from '../../types/IConnection';
import { Commands } from '../extensionCommands/commands';
import { Constants } from '../../util/constants';

export const applyQuery = async (query: IQuery) => {
    const connection = Memory.state.get<IConnection>(Constants.ACTIVE_CONNECTION);
    if (!connection) {
        vscode.window.showErrorMessage("Please connect to a cluster before opening editor");
        return;
    }
    const activeTextEditor = vscode.window.activeTextEditor;
    if (
        activeTextEditor &&
        activeTextEditor.document.languageId === "SQL++"
    ) {
        activeTextEditor.edit((editBuilder) => {
            editBuilder.replace(
                new vscode.Range(0, 0, activeTextEditor.document.lineCount, 0),
                query.query // Replace the entire content with the query
            );
        });
        activeTextEditor.document.save();
    } else {
        await vscode.commands.executeCommand(Commands.openQueryWorkbench);
        // Wait for editor to become active, If exceeds 3 seconds, then error is thrown
        let timeElapsed = 0; // in ms
        let timeInterval = 200; // in ms
        let totalTime = 3000; //in ms
        while (true) {
            await new Promise(resolve => setTimeout(resolve, timeInterval));
            const newActiveTextEditor = vscode.window.activeTextEditor;
            if (newActiveTextEditor && newActiveTextEditor.document.languageId === "SQL++") {
                const lineCount = newActiveTextEditor.document.lineCount;
                newActiveTextEditor.edit((editBuilder) => {
                    editBuilder.replace(
                        new vscode.Range(0, 0, lineCount, 0),
                        query.query
                    );
                });
                newActiveTextEditor.document.save();
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