import * as vscode from 'vscode';
import { IQuery } from "../../types/IQuery";
import { deleteQuery, getQueryHistory } from "../../util/queryHistory";
import { QueryHistoryTreeProvider } from '../../tree/QueryHistoryTreeProvider';

export const deleteQueryItem = async (delQuery: IQuery, queryHistoryTreeProvider: QueryHistoryTreeProvider) => {
    deleteQuery(delQuery);
    queryHistoryTreeProvider.refresh();
    vscode.window.showInformationMessage("Query deleted successfully from history");
};