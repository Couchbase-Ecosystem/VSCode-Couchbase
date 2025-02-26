import * as vscode from 'vscode';
import { getActiveConnection } from '../../util/connections';
import { Memory } from '../../util/util';


export async function setQueryTimeout(context: vscode.ExtensionContext) {
    const connection = getActiveConnection();
    if (!connection) {
        vscode.window.showErrorMessage('No connection found');
        return;
    }

    const timeout = await vscode.window.showInputBox({
        prompt: 'Enter the query timeout in seconds',
        value: '600',
    });

    if (!timeout) {
        vscode.window.showErrorMessage('No timeout provided');
        return;
    }

    Memory.state.update('queryTimeout', timeout);
    vscode.window.showInformationMessage(`Query timeout set to ${timeout} seconds`);
}