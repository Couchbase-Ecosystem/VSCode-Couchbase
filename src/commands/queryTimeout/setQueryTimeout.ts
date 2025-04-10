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
        prompt: 'Enter the query timeout in seconds (maximum: 1800)',
        value: '600',
    });

    if (!timeout) {
        vscode.window.showWarningMessage('No timeout provided');
        return;
    }

    const timeoutValue = parseInt(timeout, 10);
    if (isNaN(timeoutValue) || timeoutValue <= 0) {
        vscode.window.showErrorMessage('Invalid timeout value. Please enter a positive number.');
        return;
    }

    if (timeoutValue > 1800) {
        vscode.window.showWarningMessage('Timeout exceeds the maximum limit of 1800 seconds. Setting to 1800.');
        Memory.state.update('queryTimeout', '1800');
        vscode.window.showInformationMessage('Query timeout set to 1800 seconds');
    } else {
        Memory.state.update('queryTimeout', timeout);
        vscode.window.showInformationMessage(`Query timeout set to ${timeoutValue} seconds`);
    }
}