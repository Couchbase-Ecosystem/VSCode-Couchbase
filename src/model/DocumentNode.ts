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

export default class DocumentNode extends vscode.TreeItem {
  constructor(
    public readonly parentNode: INode,
    public readonly documentName: string,
    public readonly connection: IConnection,
    public readonly scopeName: string,
    public readonly bucketName: string,
    public readonly collectionName: string,
    public readonly isScopesandCollections: boolean,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(documentName, collapsibleState);
    this.tooltip = `${this.documentName}`;
    this.description = this.documentName;
  }

  public getTreeItem(): vscode.TreeItem {
    return {
      label: `${this.documentName}`,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      contextValue: "document",
      command: {
        command: "vscode-couchbase.openDocument",
        title: "Open Document",
        arguments: [this],
      },
      iconPath: {
        light: path.join(
          __filename,
          "..",
          "..",
          "images/light",
          "documents-icon.svg"
        ),
        dark: path.join(
          __filename,
          "..",
          "..",
          "images/dark",
          "documents-icon.svg"
        ),
      },
    };
  }

  public async getChildren(): Promise<INode[]> {
    return [];
  }
}
