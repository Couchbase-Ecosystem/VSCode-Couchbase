import { logger } from "../../../logger/logger";
import { CacheService } from "../../../util/cacheService/cacheService";
import * as vscode from 'vscode';

export const availableActions = ["Data Import", "Send Feedback", "Data Export", "DDL Export", "Open Query Editor", "Open SQL++ Notebook"];

export const jsonParser = async (text: string) => {
    const jsonObjects: object[] = [];
    const regex = /{[^{}]*}/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        try {
            jsonObjects.push(JSON.parse(match[0]));
        } catch (error) {
            logger.error('Failed to parse JSON: ' + error);
        }
    }
    return jsonObjects;
};

export const availableCollections = async (cacheService: CacheService):Promise<string> =>  {
    let allCollectionsArr = await cacheService.getAllCollections();
    if (allCollectionsArr.length > 50) {
        allCollectionsArr = allCollectionsArr.slice(0,50);
    }
    return  allCollectionsArr.join(", ");
};

export const getSelectedCode = () => {
    let codeSelected = `The Code by user is: \n: 
    `;
    let codeSelectedAvailable: boolean = false;
    
    const config = vscode.workspace.getConfiguration('couchbase');
    const editor = vscode.window.activeTextEditor;
    
    if (editor && config.get("iQ.enableCodeSelectionResult")) {
        const selection = editor.selection;
        if (selection && !selection.isEmpty) {
            const selectedText = editor.document.getText(selection);
            codeSelected += selectedText + " \n ";
            codeSelectedAvailable = true;
        }
    }
    if(codeSelectedAvailable){
        return codeSelected;
    } else {
        return "";
    }
};