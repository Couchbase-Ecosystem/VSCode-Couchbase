import { fetchNamedParameters } from "../pages/namedParameters/namedParameters";
import { IKeyValuePair } from "../types/IKeyValuePair";
import { Constants } from "./constants";
import { Global } from "./util";
import * as vscode from "vscode";
const fs = require('fs');
const path = require('path');

export function getUsersNamedParameters(): IKeyValuePair[] {
    try {
        let config = vscode.workspace.getConfiguration('couchbase');
        let userNamedParametersObject = config.get<{ [key: string]: string }>('workbench.userNamedParameters');
        if (!userNamedParametersObject) {
            return [];
        }
        let userNamedParameters: IKeyValuePair[] = Object.entries(
            userNamedParametersObject
        ).map(([key, value]) => ({ key, value }));
        return userNamedParameters;
    } catch (error) {
        console.error("Error reading userNamedParameters from config:", error);
        return [];
    }
}

export function getProjectsNamedParameters(): IKeyValuePair[] {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
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
