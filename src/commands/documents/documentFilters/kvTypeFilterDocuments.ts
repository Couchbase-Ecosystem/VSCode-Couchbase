import CollectionNode from "../../../model/CollectionNode";
import { getActiveConnection } from "../../../util/connections";
import * as vscode from "vscode";
import { Memory } from "../../../util/util";
import { clearDocumentFilter } from "./clearDocumentFilter";

export const kvTypeFilterDocuments = async (node: CollectionNode) => {
    const connection = getActiveConnection();
    if (!connection) {
        return;
    }

    const docFilter = Memory.state.get<string>(
        `kvTypeFilterDocuments-${connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`
    );
    const filterStmt: string = docFilter ?? "";

    const [startingDocId, endingDocId] = filterStmt.split('|');

    let collectionName = node.collectionName;
    if (collectionName.length > 15) {
        collectionName = collectionName.substring(0, 13) + "...";
    }

    const newStartingDocId = await vscode.window.showInputBox({
        title: `for collection \`${collectionName}\`; Enter Document ID range starting from`,
        placeHolder: `starting...`,
        value: startingDocId,
        prompt: `This may reset other document filters | If you want to include all starting documents, leave this field blank | `,
    });
    if (newStartingDocId === undefined) {
        return;
    }

    const newEndingDocId = await vscode.window.showInputBox({
        title: `for collection \`${collectionName}\`; Enter Document ID range ending at`,
        placeHolder: `ending...`,
        value: endingDocId,
        prompt: `If you want to include all ending documents, leave this field blank | `,
    });
    if (newEndingDocId === undefined) {
        return;
    }

    clearDocumentFilter(node);

    Memory.state.update(
        `filterDocumentsType-${connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`,
        `kv`
    );

    Memory.state.update(
        `kvTypeFilterDocuments-${connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`,
        `${newStartingDocId}|${newEndingDocId}`
    );
};