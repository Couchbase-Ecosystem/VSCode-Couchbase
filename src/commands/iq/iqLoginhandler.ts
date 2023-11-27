import { Constants } from "../../util/constants";
import { Global, Memory } from "../../util/util";
import { iqRestApiService } from "./iqRestApiService";
import * as vscode from 'vscode';
import * as keytar from 'keytar';

interface IFormData {
    username: string;
    password: string;
    rememberMe: boolean;
}

export interface ISavedLoginDataGetter {
    doesLoginDetailsExists: boolean;
    username: string
}

const getSessionsJwt = async (formData: IFormData) => {
    return await iqRestApiService.capellaLogin(formData.username, formData.password);
};


export const iqLoginHandler = async (formData: IFormData) => {
    // Check for remember me
    if(formData.rememberMe === true){
        Global.state.update(Constants.IQ_USER_ID, formData.username);
        keytar.setPassword(Constants.IQ_PASSWORD, formData.username, formData.password);
    }

    // Return organization select page data
    const jwtToken = await getSessionsJwt(formData);
    Memory.state.update("vscode-couchbase.iq.jwtToken", jwtToken);
    const organizations = await iqRestApiService.loadOrganizations(jwtToken);
    return organizations;
};

export const iqSavedLoginDataGetter = async (): Promise<ISavedLoginDataGetter> => {
    const username = Global.state.get<string>(Constants.IQ_USER_ID);
    if(username && username!==""){
        // Username exists, sending it back to webview
        return {
            doesLoginDetailsExists: true,
            username: username
        };
    } else {
        return {
            doesLoginDetailsExists: false,
            username: ""
        };
    }
};

export const iqSavedLoginHandler = async (username: string ) => {
    const password = await keytar.getPassword(Constants.IQ_PASSWORD, username);
    if(password) {
        // Return organization select page data
        const jwtToken = await getSessionsJwt({
            username: username,
            password: password,
            rememberMe: true
        });
        Memory.state.update("vscode-couchbase.iq.jwtToken", jwtToken);
        const organizations = await iqRestApiService.loadOrganizations(jwtToken);
        return organizations;
    } else{ 
        return undefined;
    }
};