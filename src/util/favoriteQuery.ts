
import { fetchFavoriteQueries } from "../pages/FavoriteQueries/FavoriteQueries";
import { favoriteQueryType } from "../types/FavoriteQueryType";
import { IKeyValuePair } from "../types/IKeyValuePair";
import { Constants } from "./constants";
import { Global } from "./util";
import * as vscode from "vscode";

export function getFavoriteQueries(): favoriteQueryType {
    let favQueries = Global.state.get<favoriteQueryType>(Constants.FAVORITE_QUERY);
    if (favQueries === undefined) {
        Global.state.update(Constants.FAVORITE_QUERY, []);
        return [];
    } else {
        return favQueries;
    }
}

export async function saveFavoriteQuery(newQuery: IKeyValuePair): Promise<favoriteQueryType> {
    let favoriteQueries = getFavoriteQueries();
    for (let query of favoriteQueries) {
        if (query.key === newQuery.key) {
            vscode.window.showErrorMessage("Key already exists: please try again with a new key");
            return favoriteQueries;
        }
    }
    favoriteQueries.push({ key: newQuery.key, value: newQuery.value });
    await Global.state.update(Constants.FAVORITE_QUERY, favoriteQueries);
    vscode.window.showInformationMessage('Favorite Query Saved Successfully');
    return favoriteQueries;
}

export async function deleteFavoriteQuery(key: string, context: vscode.ExtensionContext): Promise<favoriteQueryType> {
    let favoriteQueries = getFavoriteQueries();
    let lenOfFavQueries = favoriteQueries.length;
    let deleted = false;
    for (let i = 0; i < lenOfFavQueries; i++) {
        if (favoriteQueries[i].key === key) {
            favoriteQueries.splice(i, 1);
            deleted = true;
            break;
        }
    }
    if (!deleted) {
        vscode.window.showErrorMessage("No favorite query with the given key exists: Aborting deletion");
        return favoriteQueries;
    } else {
        await Global.state.update(Constants.FAVORITE_QUERY, favoriteQueries);
        fetchFavoriteQueries(context);
        vscode.window.showInformationMessage("Query deleted successfully");
        return favoriteQueries;
    }
}