import CollectionNode from "../../model/CollectionNode";
import { Memory } from "../../util/util";

export const clearDocumentFilter = async (node: CollectionNode) => {
    Memory.state.update(
        `filterDocuments-${node.connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`,
        ""
    );
};