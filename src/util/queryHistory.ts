import { IQuery } from "../types/IQuery";
import { Constants } from "./constants";
import { Global, Memory } from "./util";
import * as vscode from "vscode";

export function getQueryHistory() {
    return Global.state.get<IQuery[]>(Constants.QUERY_HISTORY);
  }
  
export async function saveQuery(newQuery: IQuery): Promise<IQuery> {
    let queryHistory = getQueryHistory();
    if (!queryHistory) {
        queryHistory = [];
    }
    
   queryHistory.push(newQuery);
   if(queryHistory.length > 100) {
    queryHistory.shift();
   }

    await Global.state.update(Constants.QUERY_HISTORY, queryHistory);
    return newQuery;
  }