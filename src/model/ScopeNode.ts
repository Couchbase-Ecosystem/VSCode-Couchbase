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
import { IConnection } from "./IConnection";
import { INode } from "./INode";
import { AxiosRequestConfig } from "axios";
import get from "axios";
import { ENDPOINTS } from "../util/endpoints";
import CollectionNode from "./CollectionNode";

export class ScopeNode implements INode {
  constructor(
    private readonly connection: IConnection,
    private readonly scopeName: string,
    private readonly bucketName: string,
    private readonly collections: any[],
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {}

  public getTreeItem(): vscode.TreeItem {
    return {
      label: `${this.scopeName}`,
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      contextValue: "database",
      iconPath: path.join(__filename, "..", "..", "images", "scopes-icon.svg"),
    };
  }

  public async getChildren(): Promise<INode[]> {
    let collectionList: CollectionNode[] = [];

    for (const collection of this.collections) {
      try {
        const options: AxiosRequestConfig = {
          auth: {
            username: this.connection.username,
            password: this.connection.password ? this.connection.password : "",
          },
        };

        const documentResponse = await get(
          `${this.connection.url}${ENDPOINTS.GET_POOLS}/${this.bucketName}/scopes/${this.scopeName}/collections/${collection.name}/docs/`,
          options
        );
        const collectionTreeItem = new CollectionNode(
          this.connection,
          this.scopeName,
          documentResponse.data,
          this.bucketName,
          collection.name,
          vscode.TreeItemCollapsibleState.None
        );
        collectionList.push(collectionTreeItem);
      } catch (err: any) {
        console.log(err);
        throw new Error(err);
      }
    }
    return collectionList;
  }
}
