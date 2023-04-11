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
import { IndexDirectory } from "./IndexDirectory";
import { CollectionDirectory } from "./CollectionDirectory";

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
      contextValue: "scope",
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

  public async getChildren(): Promise<INode[]> {
    let scopeItem: any[] = [];
    const indexItem = new IndexDirectory(
      this,
      this.connection,
      "Indexes",
      this.bucketName,
      this.scopeName,
      [],
      vscode.TreeItemCollapsibleState.None
    );

    const collectionItem = new CollectionDirectory(
      this,
      this.connection,
      "Collections",
      this.bucketName,
      this.scopeName,
      this.collections,
      vscode.TreeItemCollapsibleState.None
    );
    scopeItem.push(indexItem);
    scopeItem.push(collectionItem);
    return scopeItem;
  }
}
