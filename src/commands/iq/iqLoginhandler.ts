import { Memory } from "../../util/util";
import { iqRestApiService } from "./iqRestApiService";
import * as vscode from 'vscode';

interface IFormData {
    username: string;
    password: string;
    rememberMe: boolean;
}


/*  
TODO's:
    1. Get session key token
    2. check iq availability once using a dummy rest api
    3. Return with session data. Maybe handle a way to 
*/

const getSessionsJwt = async (formData: IFormData) => {
    return await iqRestApiService.capellaLogin(formData.username, formData.password);
};

export const iqLoginHandler = async (formData: IFormData) => {
    // Return organization select page data
    const jwtToken = await getSessionsJwt(formData);
    Memory.state.update("vscode-couchbase.iq.jwtToken", jwtToken);
    const organizations = await iqRestApiService.loadOrganizations(jwtToken);
    // iqRestApiService.sendIqMessage(jwtToken, organizations[1].id);
    return organizations;
};