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
import DocumentNode from "./DocumentNode";
import { PagerNode } from "./PagerNode";

export default class CollectionNode implements INode {
  constructor(
    public readonly connection: IConnection,
    public readonly scopeName: string,
    public readonly documentCount: number,
    public readonly bucketName: string,
    public readonly collectionName: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public limit: number = 10
  ) {
    vscode.workspace.fs.createDirectory(vscode.Uri.parse(`couchbase:/${bucketName}/${scopeName}/${collectionName}`));
  }

  public async getTreeItem(): Promise<vscode.TreeItem> {
    return {
      label: `${this.collectionName} (${this.documentCount})`,
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      contextValue: "collection",
      iconPath: {
        light: path.join(__filename, "..", "..", "images/light", "collection-icon.svg"),
        dark: path.join(__filename, "..", "..", "images/dark", "collection-icon.svg"),
      }
    };
  }

  public async getChildren(): Promise<INode[]> {
    let documentList: INode[] = [];
    // TODO: default limit could be managed as user settings / preference
    const result = await this.connection.cluster?.query(`SELECT RAW META().id FROM \`${this.bucketName}\`.\`${this.scopeName}\`.\`${this.collectionName}\` LIMIT ${this.limit}`);
    result?.rows.forEach((documentName: string) => {
      const documentTreeItem = new DocumentNode(
        documentName,
        this.connection,
        this.scopeName,
        this.bucketName,
        this.collectionName,
        true,
        vscode.TreeItemCollapsibleState.None
      );
      documentList.push(documentTreeItem);
    });

    // TODO: add local only (un-synchronized) files to documentList

    if (this.documentCount !== documentList.length) {
      documentList.push(new PagerNode(this));
    }
    return documentList;
  }
}
