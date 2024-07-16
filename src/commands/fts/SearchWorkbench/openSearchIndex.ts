import * as vscode from "vscode";
import SearchIndexNode from "../../../model/SearchIndexNode";
import { DocumentNotFoundError } from "couchbase/dist/errors";
import { logger } from "../../../logger/logger";
import { MemFS } from "../../../util/fileSystemProvider";
import ClusterConnectionTreeProvider from "../../../tree/ClusterConnectionTreeProvider";
import { getActiveConnection } from "../../../util/connections";
import { CouchbaseRestAPI } from "../../../util/apis/CouchbaseRestAPI";

export const openSearchIndex = async (searchIndexNode: SearchIndexNode, clusterConnectionTreeProvider: ClusterConnectionTreeProvider, uriToCasMap: Map<string, string>, memFs: MemFS) => {
    try {
        const connection = getActiveConnection();
        if (!connection) {
            return false;
        }
        const api = new CouchbaseRestAPI(connection);
        const result = await api.fetchSearchIndexDefinition(searchIndexNode.indexName);

        if (result?.indexDef instanceof Uint8Array || result?.indexDef instanceof Uint16Array || result?.indexDef instanceof Uint32Array) {
            vscode.window.showInformationMessage("Unable to open Index definition: It is not a valid JSON", { modal: true });
            return false;
        }
        const uri = vscode.Uri.parse(
            `couchbase:/${searchIndexNode.bucketName}/${searchIndexNode.scopeName}/Search/${searchIndexNode.indexName}.json`
        );
        if (result) {
            uriToCasMap.set(uri.toString(), result.indexDef.toString());
        }
        try {
            memFs.writeFile(
                uri,
                Buffer.from(JSON.stringify(result?.indexDef, null, 2)),
                { create: true, overwrite: true }
            );
        } catch (error) {
            logger.error("Failed to open Index definition, as it is not a valid JSON");
            vscode.window.showInformationMessage("Unable to open Index definition: It is not a valid JSON ", { modal: true });
            return false;
        }
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document, { preview: false });
        return true;
    } catch (err: any) {
        if (err instanceof vscode.FileSystemError && err.name === 'EntryNotFound (FileSystemError)' || err instanceof DocumentNotFoundError) {
            clusterConnectionTreeProvider.refresh();
        }
        logger.error("Failed to open Document");
        logger.debug(err);
    }


}