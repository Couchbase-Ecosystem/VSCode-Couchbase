import { Constants } from "../../util/constants";
import { Memory } from "../../util/util";
import * as vscode from 'vscode';
import { iqRestApiService } from "./iqRestApiService";

export const iqLogoutHandler = () =>{
    const iqWebview = Memory.state.get<vscode.WebviewView>(Constants.IQ_WEBVIEW);
    iqWebview?.webview.postMessage({
        command: "vscode-couchbase.iq.sendLogoutRequest"
    });
};

export const removeJWT = () => {
    const jwtToken = Memory.state.get<string>("vscode-couchbase.iq.jwtToken");
    if(jwtToken !== undefined && jwtToken !== "") {
        Memory.state.update("vscode-couchbase.iq.jwtToken", "");
        iqRestApiService.capellaLogout(jwtToken);
    }
};