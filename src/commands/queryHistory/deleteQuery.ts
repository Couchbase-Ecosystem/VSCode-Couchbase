import * as vscode from 'vscode';
import { IQuery } from "../../types/IQuery";
import { deleteQuery, getQueryHistory } from "../../util/queryHistory";
import { QueryHistoryTreeProvider } from '../../tree/QueryHistoryTreeProvider';

export const deleteQueryItem = async (delQuery: IQuery, queryHistoryTreeProvider: QueryHistoryTreeProvider) => {
    vscode.window.showWarningMessage(`Are you sure you want to delete the query from query history? Query: ${delQuery.query}`,
    "Yes",
    "No").then((value)=>{
        if(value === "Yes"){
            deleteQuery(delQuery);
            queryHistoryTreeProvider.refresh();
            vscode.window.showInformationMessage("Query deleted successfully from history");
        }
    });
};