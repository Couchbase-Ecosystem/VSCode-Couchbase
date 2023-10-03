import CollectionNode from "../../model/CollectionNode";
import * as vscode from 'vscode';
import { Memory } from "../../util/util";
import { IFilterDocuments } from "../../types/IFilterDocuments";

export const filterDocuments = async (node: CollectionNode) => {
    const docFilter = Memory.state.get<IFilterDocuments>(`filterDocuments-${node.connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`);
    const filterStmt: string = docFilter ? docFilter.filter : "";
    let collectionName = node.collectionName;
    if (collectionName.length > 15) {
        collectionName = collectionName.substring(0, 13) + '...';
    }
    const newDocFilterStmt = await vscode.window.showInputBox({
        title: `Apply filter for collection \`${collectionName}\``,
        placeHolder: `airline="AI" OR country="United States"`,
        value: filterStmt,
        prompt: `SELECT meta.id() FROM \`${collectionName}\` WHERE [Your Filter] | `,
        validateInput: (input) => {
            const tokens = input.split(" ");
            for (const token of tokens) {
                if ((token.trim().toUpperCase() === "OFFSET") || (token.trim().toUpperCase() === "LIMIT")) {
                    return "The filters should not contain LIMIT and OFFSET";
                }
            }
            return null;
        },
    });
    if (newDocFilterStmt === undefined) {
        return;
    }
    const newDocFilter: IFilterDocuments = {
        filter: newDocFilterStmt.trim()
    };
    Memory.state.update(
        `filterDocuments-${node.connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`,
        newDocFilter
    );
};