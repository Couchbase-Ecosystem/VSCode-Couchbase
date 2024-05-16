import CollectionNode from "../../model/CollectionNode";
import { getActiveConnection } from "../../util/connections";
import { Memory } from "../../util/util";

export const clearDocumentFilter = async (node: CollectionNode) => {
    const connection = getActiveConnection();
    if(!connection){
        return;
    }
    Memory.state.update(
        `filterDocuments-${connection.connectionIdentifier}-${node.bucketName}-${node.scopeName}-${node.collectionName}`,
        ""
    );
};