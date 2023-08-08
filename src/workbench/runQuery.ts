import * as vscode from 'vscode';
import { getActiveConnection } from '../util/connections';
import { logger } from '../logger/logger';


export const runCouchbaseQuery = async () => {
    const connection = getActiveConnection();
    if (!connection) {
        vscode.window.showInformationMessage("Kindly establish a connection with the cluster before executing query.");
        return false;
    }
    // Get the active text editor
    const activeTextEditor = vscode.window.activeTextEditor;
    if (
        activeTextEditor &&
        activeTextEditor.document.languageId === "SQL++"
    ) {
        // Get the text content of the active text editor.
        const query = activeTextEditor.document.getText();
        const result = await connection.cluster?.query(query);

    }
};