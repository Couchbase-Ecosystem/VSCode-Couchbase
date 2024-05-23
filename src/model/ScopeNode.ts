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
import { INode } from "../types/INode";
import { Memory } from "../util/util";
import { getActiveConnection } from "../util/connections";
import CollectionNode from "./CollectionNode";
import { logger } from "../logger/logger";
import InformationNode from "./InformationNode";
import { ParsingFailureError, PlanningFailureError } from "couchbase";
import { hasQueryService } from "../util/common";
import { CouchbaseRestAPI } from "../util/apis/CouchbaseRestAPI";
import { CacheService } from "../../src/util/cacheService/cacheService";


export class ScopeNode implements INode {
  constructor(
    public readonly parentNode: INode,
    public readonly scopeName: string,
    public readonly bucketName: string,
    public readonly collections: any[],
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public cacheService: CacheService 
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
    const connection = getActiveConnection();
    if (!connection) {
      return [];
    }
    const collectionList: any[] = [];
    const couchbaseRestAPI = new CouchbaseRestAPI(connection);
    const KVCollectionCount: Map<string, number> = await couchbaseRestAPI.getKVDocumentCount(this.bucketName, this.scopeName);

    for (const collection of this.collections) {
      try {
        const queryTypeFilter = Memory.state.get<string>(
          `queryTypeFilterDocuments-${connection.connectionIdentifier}-${this.bucketName}-${this.scopeName}-${collection.name}`
        ) ?? "";

        const filterDocumentsType =  Memory.state.get<string>(
          `filterDocumentsType-${connection.connectionIdentifier}-${this.bucketName}-${this.scopeName}-${collection.name}`
        ) ?? "";

        let rowCount = 0;
        try {
          if (!hasQueryService(connection?.services) || filterDocumentsType !== "query") {
            rowCount = KVCollectionCount.get(`kv_collection_item_count-${this.bucketName}-${this.scopeName}-${collection.name}`) ?? 0;

            if(filterDocumentsType === "kv") {
              rowCount = -1;
            }
          }
          else {
            const queryResult = await connection?.cluster?.query(
              `select count(1) as count from \`${this.bucketName}\`.\`${this.scopeName
              }\`.\`${collection.name}\` ${queryTypeFilter.length > 0 ? "WHERE " + queryTypeFilter : ""
              };`
            );
            rowCount = queryResult?.rows[0].count;
          }
        } catch (err: any) {
          if (err instanceof PlanningFailureError) {
            vscode.window.showErrorMessage(
              "Unable to find primary index for document and filter seems to be applied, showing count as 0"
            );
          } else if (err instanceof ParsingFailureError) {
            logger.error(`In Scope Node: ${this.scopeName}: Parsing Failed: Incorrect filter definition`);
          }
        }

        const collectionTreeItem = new CollectionNode(
          this,
          this.scopeName,
          rowCount,
          this.bucketName,
          collection.name,
          vscode.TreeItemCollapsibleState.None,
          this.cacheService
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
