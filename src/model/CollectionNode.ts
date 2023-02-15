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
import { PlanningFailureError } from "couchbase";

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

  public abbreviateCount(count: number): string {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      return (count / 1000).toFixed(1) + 'k';
    } else if (count < 1000000000) {
      return (count / 1000000).toFixed(1) + 'm';
    } else {
      return (count / 1000000000).toFixed(1) + 'b';
    }
  }

  public async getTreeItem(): Promise<vscode.TreeItem> {
    return {
      label: `${this.collectionName} (${this.abbreviateCount(this.documentCount)})`,
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
    let result;
    // A primary index is required for database querying. If one is present, a result will be obtained. 
    // If not, the user will be prompted to create a primary index before querying.
    try {
      result = await this.connection.cluster?.query(
        `SELECT RAW META().id FROM \`${this.bucketName}\`.\`${this.scopeName}\`.\`${this.collectionName}\` LIMIT ${this.limit}`
      );
    } catch (err) {
      if (err instanceof PlanningFailureError) {
        const answer = await vscode.window.showWarningMessage(
          "No suitable index was found for listing the Collection's documents. If you are NOT in a production environment we recommend you to create a Primary Index for it. Would you like to create one?",
          { modal: true },
          "Yes",
          "No"
        );
        if (answer === "Yes") {
          await this.connection.cluster?.query(
            `CREATE PRIMARY INDEX ON \`${this.bucketName}\`.\`${this.scopeName}\`.\`${this.collectionName}\` USING GSI`
          );
          result = await this.connection.cluster?.query(
            `SELECT RAW META().id FROM \`${this.bucketName}\`.\`${this.scopeName}\`.\`${this.collectionName}\` LIMIT ${this.limit}`
          );
        }
      }
    }
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
