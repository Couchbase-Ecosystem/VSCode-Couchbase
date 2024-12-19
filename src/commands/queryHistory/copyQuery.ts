import * as vscode from 'vscode';
import { IQuery } from "../../types/IQuery";

export const copyQuery = (query: IQuery) => {
    try {
        vscode.env.clipboard.writeText(query.query);
        vscode.window.showInformationMessage("Query copied to clipboard successfully");
    } catch(err){
        vscode.window.showErrorMessage("Error while copying query to clipboard");
    }
};