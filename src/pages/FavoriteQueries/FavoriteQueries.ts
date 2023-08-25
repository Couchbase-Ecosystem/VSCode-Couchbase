import * as vscode from 'vscode';
import * as path from 'path';
import { logger } from '../../logger/logger';
import { showFavoriteQueries } from '../../webViews/favoriteQueries.webiew';
export const fetchFavoriteQueries = (context: vscode.ExtensionContext) => {
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
        const onDiskPath = vscode.Uri.file(path.join(context.extensionPath, 'src/webviews/styles/queryContext.css'));
        const styleSrc = currentPanel.webview.asWebviewUri(onDiskPath);
        console.log(context);
        const onDiskPathEditLogo = vscode.Uri.joinPath(context.extensionUri, 'images', 'edit-icon.svg');
        const editLogo = currentPanel.webview.asWebviewUri(onDiskPathEditLogo);

       

        currentPanel.webview.html = showFavoriteQueries();

    } catch (err) {
       logger.error("failed to open and set query context: " + err);
        logger.debug(err);
    }
};