import { Constants } from "../../util/constants";
import { Memory } from "../../util/util";
import * as vscode from 'vscode';

export const iqLogoutHandler = () =>{
    const iqWebview = Memory.state.get<vscode.WebviewView>(Constants.IQ_WEBVIEW);
    iqWebview?.webview.postMessage({
        command: "vscode-couchbase.iq.sendLogoutRequest"
    });
};