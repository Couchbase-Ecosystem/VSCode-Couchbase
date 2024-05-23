import * as vscode from 'vscode';
import * as path from 'path';
import { logger } from '../../logger/logger';
import { showFavoriteQueries } from '../../webViews/favoriteQueries.webiew';
import { applyQuery } from '../../commands/queryHistory/applyQuery';
import { Memory, getUUID } from '../../util/util';
import { deleteFavoriteQuery } from '../../util/favoriteQuery';
import { IConnection } from '../../types/IConnection';
import { Constants } from '../../util/constants';

export interface IFavoriteQueriesWebviewState {
    webviewPanel: vscode.WebviewPanel
}

export const fetchFavoriteQueries = (context: vscode.ExtensionContext) => {
    console.log("context is", context);
    const favoriteQueryWebviewDetails = Memory.state.get<IFavoriteQueriesWebviewState>(Constants.FAVORITE_QUERIES_WEBVIEW);
    if (favoriteQueryWebviewDetails) {
        // Favorite Queries Webview already exists, Closing existing and creating new
        favoriteQueryWebviewDetails.webviewPanel.dispose();
        Memory.state.update(Constants.FAVORITE_QUERIES_WEBVIEW, null);
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
        currentPanel.webview.html = showFavoriteQueries();
        currentPanel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'vscode-couchbase.pasteQuery':
                    const dataFromWebview = message.query;
                    const connection = Memory.state.get<IConnection>(Constants.ACTIVE_CONNECTION);
                    if (!connection) {
                        vscode.window.showErrorMessage("Please connect to a cluster before pasting a query");
                        return;
                    }
                    currentPanel.dispose();
                    await new Promise((resolve) => setTimeout(resolve, 200));
                    applyQuery({ query: dataFromWebview, id: getUUID() });

                    break;
                case 'vscode-couchbase.deleteQuery':
                    const queryId = message.id;
                    vscode.window.showWarningMessage(`Are you sure you want to delete the query from favorite queries? Query: ${message.query}`,
                        "Yes",
                        "No").then((value)=>{
                            if(value === "Yes"){
                                deleteFavoriteQuery(queryId, context);
                            }
                        });
                    break;
                case 'vscode-couchbase.queryNotSelected':
                    vscode.window.showErrorMessage("Please select a query before performing an action");
                    break;
            }
        });

        currentPanel.onDidDispose(() => {
            Memory.state.update(Constants.FAVORITE_QUERIES_WEBVIEW, null);
        });

        Memory.state.update(Constants.FAVORITE_QUERIES_WEBVIEW, {
            webviewPanel: currentPanel
        });


    } catch (err) {
        logger.error(`failed to open and set query context: ${err}`);
        logger.debug(err);
    }
};