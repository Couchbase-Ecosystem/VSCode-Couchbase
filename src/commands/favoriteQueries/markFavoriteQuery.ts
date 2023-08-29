import * as vscode from 'vscode';
import { saveFavoriteQuery } from '../../util/favoriteQuery';
export const markFavoriteQuery = async (context: vscode.ExtensionContext) =>{
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const queryValue = activeEditor.document.getText();
        const queryKey = await vscode.window.showInputBox({
            placeHolder: 'Enter a key',
            prompt: 'Please enter a key:',
            validateInput: (value: string) => {
                return value ? '' : 'Key cannot be empty';
            },
        });
        if (queryKey === undefined) {
            vscode.window.showInformationMessage('Key is not defined');
            return;
        }
        if (queryValue === ''){
            vscode.window.showInformationMessage('Query is empty');
            return;
        }
        saveFavoriteQuery({key: queryKey, value: queryValue});
    } else {
        vscode.window.showInformationMessage('No active text editor.');
    }
};