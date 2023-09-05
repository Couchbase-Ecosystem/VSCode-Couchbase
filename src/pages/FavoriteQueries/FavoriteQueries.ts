import * as vscode from 'vscode';
import * as path from 'path';
import { logger } from '../../logger/logger';
import { showFavoriteQueries } from '../../webViews/favoriteQueries.webiew';
import { applyQuery } from '../../commands/queryHistory/applyQuery';
import { Memory, getUUID } from '../../util/util';
import { deleteFavoriteQuery } from '../../util/favoriteQuery';
import { IConnection } from '../../types/IConnection';

export interface IFavoriteQueriesWebviewParams {
    styleSrc: vscode.Uri;
}

export interface IFavoriteQueriesWebviewState {
    webviewPanel: vscode.WebviewPanel
}

export const fetchFavoriteQueries = (context: vscode.ExtensionContext) => {
    const connection = Memory.state.get<IConnection>("activeConnection");
    if (!connection) {
        vscode.window.showErrorMessage("Please connect to a cluster before opening favorite queries");
        return;
    }
    const favoriteQueryWebviewDetails = Memory.state.get<IFavoriteQueriesWebviewState>("favoriteQueriesWebview");
    if(favoriteQueryWebviewDetails){
        // Favorite Queries Webview already exists, Closing existing and creating new
        favoriteQueryWebviewDetails.webviewPanel.dispose();
        Memory.state.update("favoriteQueriesWebview",null);
    }
    const currentPanel = vscode.window.createWebviewPanel(
        "showFavoriteQueries",
        "Favorite Queries",
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            enableForms: true,
        },
    );

    try {
        const onDiskPath = vscode.Uri.file(path.join(context.extensionPath, 'src/webviews/styles/favoriteQueries.css'));
        const styleSrc = currentPanel.webview.asWebviewUri(onDiskPath);
        const onDiskPathEditLogo = vscode.Uri.joinPath(context.extensionUri, 'images', 'edit-icon.svg');
        const editLogo = currentPanel.webview.asWebviewUri(onDiskPathEditLogo);
        const UriData: IFavoriteQueriesWebviewParams = {
            styleSrc: styleSrc
        };
        currentPanel.webview.html = showFavoriteQueries(UriData);
        currentPanel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'vscode-couchbase.pasteQuery':
                    // Handle the message received from the webview
                    const dataFromWebview = message.query;
                    currentPanel.dispose();
                    await new Promise((resolve)=>setTimeout(resolve, 200));
                    applyQuery({query: dataFromWebview, id: getUUID()});
                    
                    break;
                case 'vscode-couchbase.deleteQuery':
                    const queryId = message.id;
                    deleteFavoriteQuery(queryId, context);
                    break;
                // Add more cases for other message types if needed
            }
        });

        currentPanel.onDidDispose(()=>{
            Memory.state.update("favoriteQueriesWebview",null);
        });

        Memory.state.update("favoriteQueriesWebview",{
            webviewPanel: currentPanel
        });
        

    } catch (err) {
       logger.error("failed to open and set query context: " + err);
        logger.debug(err);
    }
};