import { WebviewView } from "vscode";
import { IAdditionalContext } from "../types";
import { availableActions } from "../utils";


export const actionIntenthandler = async (jsonObject: any, webview: WebviewView) => {
    const actions = jsonObject?.actions || [];
    const resultingActions: string[] = [];
    
    if(actions.length === 0){
        return resultingActions;
    }
    for await (let action of actions) {
        if(availableActions.includes(action)){
            resultingActions.push(action);
        }
    }

    // Send back the resulting actions to webview from right here
    webview.webview.postMessage({
        command: "vscode-webview.iq.updateActions",
        actions: resultingActions
    });

    return resultingActions;
};