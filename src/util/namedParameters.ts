import { fetchNamedParameters } from "../pages/namedParameters/namedParameters";
import { IKeyValuePair } from "../types/IKeyValuePair";
import { Constants } from "./constants";
import { Global } from "./util";
import * as vscode from "vscode";
const fs = require('fs');
const path = require('path');

export function getNamedParameters(): IKeyValuePair[] {
    let namedParameters = Global.state.get<IKeyValuePair[]>(Constants.NAMED_PARAMETER);
    if (namedParameters === undefined) {
        Global.state.update(Constants.NAMED_PARAMETER, []);
        return [];
    } else {
        return namedParameters;
    }
}

export function getProjectsNamedParameters(): IKeyValuePair[] {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if(workspaceFolders && workspaceFolders.length > 0) {
        const rootPath = workspaceFolders[0].uri.fsPath;
        const filePath = path.join(rootPath, '.cbNamedParams.properties');
        let namedParameters: IKeyValuePair[] = [];
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split('\n');
    
            for (let line of lines) {
                const [key, value] = line.split('=');
                namedParameters.push({ key: key.trim(), value: value.trim() });
            }
        } catch (error) {
            console.error('Error reading .cbNamedParams.properties file:', error);
        }
        return namedParameters;
    } else {
        return [];
    }
}

export async function saveNamedParameter(newParameter: IKeyValuePair): Promise<IKeyValuePair[]> {
    let namedParameters = getNamedParameters();
    for (let parameter of namedParameters) {
        if (parameter.key === newParameter.key) {
            vscode.window.showErrorMessage("Key already exists: please try again with a new key");
            return namedParameters;
        }
    }
    namedParameters.push({ key: newParameter.key, value: newParameter.value });
    await Global.state.update(Constants.NAMED_PARAMETER, namedParameters);
    vscode.window.showInformationMessage('Named Parameter Saved Successfully');
    return namedParameters;
}

export async function deleteNamedParameter(key: string, context: vscode.ExtensionContext): Promise<IKeyValuePair[]> {
    let namedParameters = getNamedParameters();
    let lenOfNamedParameters = namedParameters.length;
    let deleted = false;
    for (let i = 0; i < lenOfNamedParameters; i++) {
        if (namedParameters[i].key === key) {
            namedParameters.splice(i, 1);
            deleted = true;
            break;
        }
    }
    if (!deleted) {
        vscode.window.showErrorMessage("No named parameter with the given key exists: Aborting deletion");
        return namedParameters;
    } else {
        await Global.state.update(Constants.NAMED_PARAMETER, namedParameters);
        fetchNamedParameters(context);
        vscode.window.showInformationMessage("Parameter deleted successfully");
        return namedParameters;
    }
}