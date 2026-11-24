import CollectionNode from "../../../model/CollectionNode";
import { getActiveConnection } from "../../../util/connections";
import * as vscode from "vscode";
import { getDocumentFilter, setKvDocumentFilter } from "../../../util/documentFilter";

export const kvTypeFilterDocuments = async (node: CollectionNode) => {
    const connection = getActiveConnection();
    if (!connection) {
        return;
    }

    const { kvStartDocId: startingDocId, kvEndDocId: endingDocId } = getDocumentFilter(connection.connectionIdentifier, node);

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

    setKvDocumentFilter(connection.connectionIdentifier, node, newStartingDocId, newEndingDocId);
};