import * as vscode from 'vscode';
import { saveFavoriteQuery } from '../../util/favoriteQuery';
import { fetchFavoriteQueries } from '../../pages/FavoriteQueries/FavoriteQueries';
export const markFavoriteQuery = async (context: vscode.ExtensionContext) =>{
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const queryValue = activeEditor.document.getText();
        const queryKey = await vscode.window.showInputBox({
            placeHolder: 'Enter a key',
            prompt: 'Please enter a key:',
            validateInput: (value: string) => {
                const pattern = /^[a-zA-Z0-9]+$/; // Only English characters and numbers are allowed
                if (!value) {
                    return 'Key cannot be empty';
                }
                if (!pattern.test(value)) {
                    return 'Key must only contain English characters and numbers';
                }
                return '';
            },
        });
        if (queryKey === undefined) {
            vscode.window.showErrorMessage('Key is not defined.');
            return;
        }
        if (queryValue === ''){
            vscode.window.showErrorMessage('Query is empty.');
            return;
        }
        saveFavoriteQuery({key: queryKey, value: queryValue});
        fetchFavoriteQueries(context);
        vscode.window.showInformationMessage('Favorite Query Saved Successfully');
    } else {
        vscode.window.showErrorMessage('No active text editor.');
    }
};