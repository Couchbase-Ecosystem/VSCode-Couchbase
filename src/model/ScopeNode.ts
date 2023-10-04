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
import { Memory } from "../util/util";
import { getActiveConnection } from "../util/connections";
import { IFilterDocuments } from "../types/IFilterDocuments";
import CollectionNode from "./CollectionNode";
import { logger } from "../logger/logger";
import InformationNode from "./InformationNode";

export class ScopeNode implements INode {
  constructor(
    public readonly parentNode: INode,
    public readonly connection: IConnection,
    public readonly scopeName: string,
    public readonly bucketName: string,
    public readonly collections: any[],
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) { }

  public getTreeItem(): vscode.TreeItem {
    return {
      label: `${this.scopeName}`,
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      contextValue: this.scopeName === "_default" ? "default_scope" : "scope",
      iconPath: {
        light: path.join(
          __filename,
          "..",
          "..",
          "images/light",
          "scopes-icon.svg"
        ),
        dark: path.join(
          __filename,
          "..",
          "..",
          "images/dark",
          "scopes-icon.svg"
        ),
      },
    };
  }
  /**
   * @returns Two Directory one contains Index definitions and other contains Collections
   * */
  public async getChildren(): Promise<INode[]> {
    const collectionList: any[] = [];
    for (const collection of this.collections) {
      try {
        let docFilter = Memory.state.get<IFilterDocuments>(`filterDocuments-${this.connection.connectionIdentifier}-${this.bucketName}-${this.scopeName}-${collection.name}`);
        const filter: string = (docFilter && docFilter.filter.length > 0) ? docFilter.filter : "";
        const connection = getActiveConnection();
        const queryResult = await connection?.cluster?.query(
          `select count(1) as count from \`${this.bucketName}\`.\`${this.scopeName}\`.\`${collection.name}\` ${filter.length > 0 ? "WHERE " + filter : ""};`
        );
        const count = queryResult?.rows[0].count;
        const collectionTreeItem = new CollectionNode(
          this,
          this.connection,
          this.scopeName,
          count,
          this.bucketName,
          collection.name,
          filter !== "",
          vscode.TreeItemCollapsibleState.None
        );
        collectionList.push(collectionTreeItem);
      } catch (err: any) {
        logger.error("Failed to load Collections");
        logger.debug(err);
        throw new Error(err);
      }
    }
    if (collectionList.length === 0) {
      collectionList.push(new InformationNode("No Collections found"));
    }
    return collectionList;
  }
}
