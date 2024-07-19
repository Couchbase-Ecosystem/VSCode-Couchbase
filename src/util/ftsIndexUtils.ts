import * as vscode from "vscode";
import SearchIndexNode from "../model/SearchIndexNode";
import { getActiveConnection } from "./connections";
import { logger } from "../logger/logger";

export async function deleteIndex(searchIndexNode: SearchIndexNode) {
    const connection = getActiveConnection();
    if (!connection) {
        return;
    }

    let answer = await vscode.window.showInformationMessage(
        `Are you sure you want to DELETE the index: ${searchIndexNode.indexName}?`,
        ...["Yes", "No"],
    );
    if (answer !== "Yes") {
        return;
    }

    try {
        const searchIndexesManager = connection?.cluster?.searchIndexes();
        searchIndexesManager?.dropIndex(searchIndexNode.indexName);
    } catch (err) {
        logger.error(
            "An error occurred while trying to delete the index" +
                searchIndexNode.indexName +
                err,
        );
        await vscode.window.showInformationMessage(
            `Could not delete the index. Please check the logs.`,
        );
    }
}
