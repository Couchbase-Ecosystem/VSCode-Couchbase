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
import * as keytar from "keytar";
import { IConnection } from "./IConnection";
import { INode } from "./INode";
import IndexNode from "./IndexNode";
import axios from "axios";
import { Constants } from "../util/constants";
import { getConnectionId } from "../util/connections";

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

    public async getChildren(): Promise<INode[]> {
        let indexesList: INode[] = [];
        let result;
        if (this.connection.url.endsWith(Constants.capellaUrlPostfix)) {
            try {
                result = await this.connection.cluster?.queryIndexes().getAllIndexes(this.bucketName, { scopeName: this.scopeName });
                if (result === undefined) { return []; }
                for (const query of result) {
                    if (query.scopeName === this.scopeName) {
                        const indexNode = new IndexNode(
                            this,
                            this.connection,
                            this.scopeName,
                            this.bucketName,
                            `${query.name.substring(1)}_${(query.collectionName ?? "")}`,
                            JSON.stringify(query, null, 2),
                            vscode.TreeItemCollapsibleState.None
                        );
                        indexesList.push(indexNode);
                    }

                }
            } catch (err) {
                console.log("Error: Could not load Indexes", err);
            }
        }
        else {
            try {
                const password = await keytar.getPassword(Constants.extensionID, getConnectionId(this.connection));
                if (!password) {
                    return [];
                }
                const requestURL = `http://${this.connection.username}:${password}@127.0.0.1:9102/getIndexStatus\?bucket\=${this.bucketName}\&scope\=${this.scopeName}`;
                result = await axios.get(requestURL);
                for (const query of result.data.status) {
                    if (query.scope === this.scopeName) {
                        const indexNode = new IndexNode(
                            this,
                            this.connection,
                            this.scopeName,
                            this.bucketName,
                            `${query.indexName.substring(1)}_${query.collection}`,
                            query.definition,
                            vscode.TreeItemCollapsibleState.None
                        );
                        indexesList.push(indexNode);
                    }
                }
            } catch (error) {
                console.log(error);
            };
        }
        if (indexesList.length === 0) {
            vscode.window.showInformationMessage("No indexes found for this bucket.scope combination. Try another bucket.scope.");
        }
        return indexesList;
    };
}
