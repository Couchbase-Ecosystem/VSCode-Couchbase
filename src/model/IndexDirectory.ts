/*
 *     Copyright 2011-2020 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import * as vscode from "vscode";
import { IConnection } from "../types/IConnection";
import { INode } from "../types/INode";
import IndexNode from "./IndexNode";
import { getActiveConnection } from "../util/connections";
import InformationNode from "./InformationNode";
import { logger } from "../logger/logger";
import { getIndexDefinition } from "../util/indexUtils";
import { CacheService } from "../util/cacheService/cacheService";

export class IndexDirectory implements INode {
    constructor(
        public readonly parentNode: INode,
        public readonly connection: IConnection,
        public readonly itemName: string,
        public readonly bucketName: string,
        public readonly scopeName: string,
        public readonly collection: string,
        public readonly indexes: any[],
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public cacheService: CacheService
    ) {
        vscode.workspace.fs.createDirectory(
            vscode.Uri.parse(
                `couchbase:/${bucketName}/${scopeName}/Indexes`
            )
        );
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: `${this.itemName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "indexDirectory",
        };
    }
    /*
    * Get Index Definition either in JSON format when connected to capella
    * or in Query format when connected to local
    */
    public async getChildren(): Promise<INode[]> {
        let indexesList: INode[] = [];
        let result;
        try {
            const connection = getActiveConnection();
            //TODO: Change it to not include IndexNode with undefined scope once the issues with undefined scope and collections fixed
            if (!connection){
                return [];
            }
            result = await connection?.cluster?.queryIndexes().getAllIndexes(this.bucketName, { scopeName: this.scopeName, collectionName: this.collection });
            if (result === undefined) { return []; }
            this.cacheService.updateCollectionIndexCache(connection,this.bucketName,this.scopeName,this.collection, result);
            for (const query of result) {
                if (query.scopeName === this.scopeName || this.scopeName === "_default") {
                    const indexNode = new IndexNode(
                        this,
                        this.connection,
                        this.scopeName,
                        this.bucketName,
                        `${query.name[0] === '#' ? query.name.substring(1) : query.name}${(query.collectionName ? ("_" + query.collectionName) : "")}`,
                        getIndexDefinition(query),
                        vscode.TreeItemCollapsibleState.None
                    );
                    indexesList.push(indexNode);
                }

            }
        } catch (err) {
            logger.error("Failed to load Indexes");
            logger.debug(err);
        }
        return indexesList;
    };
}
