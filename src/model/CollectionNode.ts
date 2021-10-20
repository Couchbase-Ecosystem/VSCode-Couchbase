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
import { IConnection } from "./IConnection";
import { INode } from "./INode";
import { ENDPOINTS } from "../util/endpoints";
import get from "axios";
import { AxiosRequestConfig } from "axios";
import DocumentNode from "./DocumentNode";

export default class CollectionNode implements INode {
  constructor(
    private readonly connection: IConnection,
    private readonly scopeName: string,
    private readonly documents: any,
    private readonly bucketName: string,
    private readonly collectionName: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {}

  public async getTreeItem(): Promise<vscode.TreeItem> {
    return {
      label: `Collection:${this.collectionName} (${this.documents.rows.length})`,
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    };
  }

  public async getChildren(): Promise<INode[]> {
    let documentList: DocumentNode[] = [];
    this.documents.rows.forEach((document: any) => {
      const documentTreeItem = new DocumentNode(
        document.id,
        this.connection,
        this.scopeName,
        this.bucketName,
        this.collectionName,
        true,
        vscode.TreeItemCollapsibleState.None
      );
      documentList.push(documentTreeItem);
    });
    return documentList;
  }
}
