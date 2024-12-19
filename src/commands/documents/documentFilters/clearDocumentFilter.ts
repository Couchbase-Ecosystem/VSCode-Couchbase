import { commands } from "vscode";
import CollectionNode from "../../../model/CollectionNode";
import { getActiveConnection } from "../../../util/connections";
import { Memory } from "../../../util/util";

export const clearDocumentFilter = (node: CollectionNode) => {
    const connection = getActiveConnection();
    if(!connection){
        return;
    }

    Memory.state.update(
        `filterDocumentsType-${connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`,
        ``
    );

    Memory.state.update(
        `queryTypeFilterDocuments-${connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`,
        ""
    );

    Memory.state.update(
        `kvTypeFilterDocuments-${connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`,
        ""
    );
};