import { IConnection } from "../../types/IConnection";
import { Memory } from "../../util/util";
import * as vscode from 'vscode';
import * as path from 'path';
import { logger } from "../../logger/logger";
import { getQueryContext } from "../../webViews/queryContext.webview";
import { IQueryContextWebviewParams } from "../../types/IQueryContextWebviewParams";

export function fetchQueryContext(context: vscode.ExtensionContext) {
    const connection = Memory.state.get<IConnection>("activeConnection");

    if (!connection) {
        vscode.window.showErrorMessage("Please connect to a cluster before setting query context");
        return;
    }
    
    const currentPanel = vscode.window.createWebviewPanel(
        "queryContext",
        "Query Context",
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            enableForms: true,
            
        },
        
    );
    currentPanel.webview.html = "Loading...";
    try {
        const onDiskPath = vscode.Uri.file(path.join(context.extensionPath, 'src/webviews/styles/queryContext.css'));
        const styleSrc = currentPanel.webview.asWebviewUri(onDiskPath);
        const onDiskPathEditLogo = vscode.Uri.joinPath(context.extensionUri, 'images', 'edit-icon.svg');
        const editLogo = currentPanel.webview.asWebviewUri(onDiskPathEditLogo);

        const vscodeURIs: IQueryContextWebviewParams = {
            styleSrc: styleSrc,
            editLogo: editLogo
        };

        currentPanel.webview.html = getQueryContext(vscodeURIs);

    } catch (err) {
       logger.error("failed to open and set query context: " + err);
        logger.debug(err);
    }
}