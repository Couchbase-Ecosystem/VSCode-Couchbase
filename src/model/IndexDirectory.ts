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
import * as path from "path";
import { IConnection } from "../types/IConnection";
import { INode } from "../types/INode";
import IndexNode from "./IndexNode";
import InformationNode from "./InformationNode";
import { logger } from "../logger/logger";
import { getIndexDefinition } from "../util/indexUtils";

export class IndexDirectory implements INode {
    constructor(
        public readonly parentNode: INode,
        public readonly connection: IConnection,
        public readonly itemName: string,
        public readonly bucketName: string,
        public readonly scopeName: string,
        public readonly indexes: any[],
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
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
            iconPath: {
                light: path.join(
                    __filename,
                    "..",
                    "..",
                    "images/light",
                    "scope-item.svg"
                ),
                dark: path.join(
                    __filename,
                    "..",
                    "..",
                    "images/dark",
                    "scope-item.svg"
                ),
            },
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
            //TODO: Change it to not include IndexNode with undefined scope once the issues with undefined scope and collections fixed
            result = await this.connection.cluster?.queryIndexes().getAllIndexes(this.bucketName, { scopeName: this.scopeName });
            if (result === undefined) { return []; }
            for (const query of result) {
                if (query.scopeName === this.scopeName || this.scopeName === "_default") {
                    const indexNode = new IndexNode(
                        this,
                        this.connection,
                        this.scopeName,
                        this.bucketName,
                        `${query.name.substring(1)}_${(query.collectionName ?? "")}`,
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
        if (indexesList.length === 0) {
            indexesList.push(new InformationNode("No Indexes found"));
        }
        return indexesList;
    };
}
