import * as vscode from 'vscode';
import { IQuery } from "../../types/IQuery";
import { deleteQuery, getQueryHistory } from "../../util/queryHistory";

export const deleteQueryItem = (delQuery: IQuery) => {
    deleteQuery(delQuery);
    vscode.window.showInformationMessage("Query deleted successfully from history");
};