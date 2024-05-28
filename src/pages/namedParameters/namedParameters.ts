import * as vscode from 'vscode';
import { logger } from '../../logger/logger';
import { showNamedParameters } from '../../webViews/namedParameters.webview';
import { Memory } from '../../util/util';
import { Constants } from '../../util/constants';

export interface INamedParametersWebviewState {
    webviewPanel: vscode.WebviewPanel
}

export const fetchNamedParameters = (isRefresh:boolean = false) => {
    const namedParametersWebviewDetails = Memory.state.get<INamedParametersWebviewState>(Constants.NAMED_PARAMETERS_WEBVIEW);
    if (namedParametersWebviewDetails) {
        if(isRefresh){
            namedParametersWebviewDetails.webviewPanel.webview.html = showNamedParameters();
            return;
        }
        // Named Parameters Webview already exists, Closing existing and creating new
        namedParametersWebviewDetails.webviewPanel.dispose();
        Memory.state.update(Constants.NAMED_PARAMETERS_WEBVIEW, null);
    }

    const currentPanel = vscode.window.createWebviewPanel(
        "showNamedParameters",
        "Named Parameters",
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            enableForms: true,
            retainContextWhenHidden: true,
        },
    );

    try {
        currentPanel.webview.html = showNamedParameters();
        currentPanel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === "openSettings") {
                vscode.commands.executeCommand('workbench.action.openSettings', "couchbase.workbench");
            } else {
                console.debug("Unhandled Message received from named parameters webview", message);
            }
            
        });

        currentPanel.onDidDispose(() => {
            Memory.state.update(Constants.NAMED_PARAMETERS_WEBVIEW, null);
        });

        Memory.state.update(Constants.NAMED_PARAMETERS_WEBVIEW, {
            webviewPanel: currentPanel
        });


    } catch (err) {
        logger.error(`failed to open and set query context: ${err}`);
        logger.debug(err);
    }
};