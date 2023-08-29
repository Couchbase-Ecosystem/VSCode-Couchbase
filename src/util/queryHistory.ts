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
    } else if(queryHistory[0].query === newQuery.query){
      // No need to add query in history as last query was same
      return newQuery;
    }
  
   queryHistory.unshift(newQuery);
   if(queryHistory.length > 100) {
    queryHistory.pop();
   }

    await Global.state.update(Constants.QUERY_HISTORY, queryHistory);
    return newQuery;
  }