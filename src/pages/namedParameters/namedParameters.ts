import * as vscode from 'vscode';
import { logger } from '../../logger/logger';
import { showNamedParameters } from '../../webViews/namedParameters.webview';
import { applyQuery } from '../../commands/queryHistory/applyQuery';
import { Memory, getUUID } from '../../util/util';
import { deleteNamedParameter } from '../../util/namedParameters';
import { IConnection } from '../../types/IConnection';
import { Constants } from '../../util/constants';

export interface INamedParametersWebviewState {
    webviewPanel: vscode.WebviewPanel
}

export const fetchNamedParameters = (context: vscode.ExtensionContext) => {
    const namedParametersWebviewDetails = Memory.state.get<INamedParametersWebviewState>(Constants.NAMED_PARAMETERS_WEBVIEW);
    if (namedParametersWebviewDetails) {
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
                    vscode.window.showWarningMessage(`Are you sure you want to delete the query from named parameters? Query: ${message.query}`,
                        "Yes",
                        "No").then((value)=>{
                            if(value === "Yes"){
                                deleteNamedParameter(queryId, context);
                            }
                        });
                    break;
                case 'vscode-couchbase.queryNotSelected':
                    vscode.window.showErrorMessage("Please select a query before performing an action");
                    break;
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