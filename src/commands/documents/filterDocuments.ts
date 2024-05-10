import CollectionNode from "../../model/CollectionNode";
import * as vscode from "vscode";
import { Memory } from "../../util/util";
import { IFilterDocuments } from "../../types/IFilterDocuments";
import { logger } from "../../logger/logger";
import { ParsingFailureError, PlanningFailureError } from "couchbase";
import { getActiveConnection } from "../../util/connections";

export const filterDocuments = async (node: CollectionNode) => {
    // Check if indexes are present for collection
    const query = `
    SELECT COUNT(*) AS indexCount FROM system:indexes
    WHERE bucket_id="${node.bucketName}" AND scope_id="${node.scopeName}" AND keyspace_id="${node.collectionName}"
  `;
    // Execute the query
    const connection = getActiveConnection();
    if(!connection){
        return;
    }
    const indexExists = await connection.cluster
        ?.query(query)
        .then((result) => {
            const rows = result.rows;
            if (!(rows.length > 0 && rows[0].indexCount > 0)) {
                // Index Doesn't Exists
                vscode.window.showErrorMessage(
                    "Filters can only be applied to collections that have at least one index."
                );
                logger.error(
                    "Error setting document filter: index doesn't exist"
                );
                return false;
            }
            return true;
        })
        .catch((err) => {
            logger.error("Error checking primary index: " + err);
            return false;
        });
    if (!indexExists) {
        return;
    }

    const docFilter = Memory.state.get<IFilterDocuments>(
        `filterDocuments-${node.connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`
    );
    const filterStmt: string = docFilter ? docFilter.filter : "";
    let collectionName = node.collectionName;
    if (collectionName.length > 15) {
        collectionName = collectionName.substring(0, 13) + "...";
    }
    const newDocFilterStmt = await vscode.window.showInputBox({
        title: `Apply filter for collection \`${collectionName}\``,
        placeHolder: `airline="AI" OR country="United States"`,
        value: filterStmt,
        prompt: `SELECT meta.id() FROM \`${collectionName}\` WHERE [Your Filter] | `,
        validateInput: (input) => {
            const tokens = input.split(" ");
            for (const token of tokens) {
                if (
                    token.trim().toUpperCase() === "OFFSET" ||
                    token.trim().toUpperCase() === "LIMIT"
                ) {
                    return "The filters should not contain LIMIT and OFFSET";
                }
            }
            return null;
        },
    });
    if (newDocFilterStmt === undefined) {
        return;
    }
    try {
        if (newDocFilterStmt.trim() !== "") {
            await node.connection.cluster?.query(`SELECT META().id FROM \`${node.bucketName}\`.\`${node.scopeName}\`.\`${collectionName}\` WHERE ${newDocFilterStmt}`);
        }
    } catch (err) {
        if (err instanceof ParsingFailureError) {
            vscode.window.showErrorMessage(
                "Parsing Failed: Incorrect filter definition"
            );
        }
        else if (err instanceof PlanningFailureError) {
            vscode.window.showErrorMessage(
                "Planning Failed: Incorrect filter definition, check if the query is correct"
            );
        }
        else {
            logger.error(err);
        }
        return;
    }

    const newDocFilter: IFilterDocuments = {
        filter: newDocFilterStmt.trim(),
    };
    Memory.state.update(
        `filterDocuments-${node.connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`,
        newDocFilter
    );
};
