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
import { getActiveConnection } from "../util/connections";
import { CacheService } from "../../src/util/cacheService/cacheService";
import { SearchDirectory } from "./SearchDirectory";
import { CollectionDirectory } from "./CollectionDirectory";
import { hasSearchService } from "../util/common";


export class ScopeNode implements INode {
  constructor(
    public readonly parentNode: INode,
    public readonly scopeName: string,
    public readonly bucketName: string,
    public readonly collections: any[],
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public cacheService: CacheService 
  ) {
    vscode.workspace.fs.createDirectory(
        vscode.Uri.parse(
          `couchbase:/${bucketName}/${scopeName}/Search`
        )
      );
}

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

    const childrenDirectoriesList: INode[] = [];

    // Search Directory
    if (hasSearchService(connection?.services)){
    childrenDirectoriesList.push(
        new SearchDirectory(
            this,
            "Search",
            this.bucketName,
            this.scopeName
        )
    );
  }

    // Collections Directory
    const collectionDirectory = new CollectionDirectory(
        this,
        this.scopeName,
        this.bucketName,
        this.collections,
        vscode.TreeItemCollapsibleState.Collapsed,
        this.cacheService
    );
    childrenDirectoriesList.push(collectionDirectory);

    return childrenDirectoriesList;

  }
}