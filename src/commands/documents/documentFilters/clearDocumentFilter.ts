import CollectionNode from "../../../model/CollectionNode";
import { getActiveConnection } from "../../../util/connections";
import { clearDocumentFilter as clearFilter } from "../../../util/documentFilter";

export const clearDocumentFilter = (node: CollectionNode) => {
    const connection = getActiveConnection();
    if(!connection){
        return;
    }

    clearFilter(connection.connectionIdentifier, node);
};
