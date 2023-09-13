import CollectionNode from "../../model/CollectionNode";
import * as vscode from 'vscode';
import { Memory } from "../../util/util";
import { IFilterDocuments } from "../../types/IFilterDocuments";
import ClusterConnectionTreeProvider from "../../tree/ClusterConnectionTreeProvider";

export const filterDocuments = async (node: CollectionNode, clusterConnectionTreeProvider: ClusterConnectionTreeProvider) => {
    let docFilter = Memory.state.get<IFilterDocuments>(`filterDocuments-${node.connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`);
    let filterStmt: string = docFilter ? docFilter.filter : "";
    let collectionName = node.collectionName;
    if (collectionName.length > 15) {
        collectionName = collectionName.substring(0, 13) + '...';
    }
    let newDocFilterStmt = await vscode.window.showInputBox({
        title: `Apply filter for collection \`${collectionName}\`` ,
        placeHolder: `airline="AI" OR equipment="772"`,
        value: filterStmt,
        prompt:`SELECT meta.id() FROM \`${collectionName}\` WHERE [Your Filter] |\n (To remove filter, please erase all text)`,
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
    let newDocFilter: IFilterDocuments = {
        filter: newDocFilterStmt.trim()
    };
    Memory.state.update(
        `filterDocuments-${node.connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`,
        newDocFilter
    );

    // Refresh collections
    clusterConnectionTreeProvider.refresh(node.parentNode);
};