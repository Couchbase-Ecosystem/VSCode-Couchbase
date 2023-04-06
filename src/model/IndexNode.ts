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
import { abbreviateCount } from "../util/common";
import { IConnection } from "./IConnection";
import { INode } from "./INode";
import { QueryIndex } from "couchbase";

export default class IndexNode extends vscode.TreeItem {
    constructor(
        public readonly parentNode: INode,
        public readonly connection: IConnection,
        public readonly scopeName: string,
        public readonly bucketName: string,
        public readonly indexName: string,
        public readonly data: QueryIndex,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(indexName, collapsibleState);
        this.tooltip = `${this.indexName}`;
        this.description = this.indexName;
    }
    public async getTreeItem(): Promise<vscode.TreeItem> {
        return {
            label: `${this.indexName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "index",
            command: {
                command: "vscode-couchbase.openIndexInfo",
                title: "Open Index Info",
                arguments: [this],
            },
            iconPath: {
                light: path.join(
                    __filename,
                    "..",
                    "..",
                    "images/light",
                    "index-icon.svg"
                ),
                dark: path.join(
                    __filename,
                    "..",
                    "..",
                    "images/dark",
                    "index-icon.svg"
                ),
            },
        };
    }
    public async getChildren(): Promise<INode[]> {
        return [];
    }
}