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
import DocumentNode from "./DocumentNode";
import { PagerNode } from "./PagerNode";
import { abbreviateCount } from "../util/common";
import { PlanningFailureError } from "couchbase";
import InformationNode from "./InformationNode";
import { Memory } from "../util/util";
import { IFilterDocuments } from "../types/IFilterDocuments";
import { SchemaDirectory } from "./SchemaDirectory";
import { getActiveConnection } from "../util/connections";
import { Commands } from "../commands/extensionCommands/commands";
import { IndexDirectory } from "./IndexDirectory";

export default class CollectionNode implements INode {
  constructor(
    public readonly parentNode: INode,
    public readonly connection: IConnection,
    public readonly scopeName: string,
    public readonly documentCount: number,
    public readonly bucketName: string,
    public readonly collectionName: string,
    public readonly filter: boolean,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public limit: number = 10
  ) {
    vscode.workspace.fs.createDirectory(
      vscode.Uri.parse(
        `couchbase:/${bucketName}/${scopeName}/Collections/${collectionName}`
      )
    );
  }

  public async getTreeItem(): Promise<vscode.TreeItem> {
    return {
      label: `${this.collectionName} (${abbreviateCount(
        this.documentCount
      )})`,
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      contextValue: (this.collectionName === '_default' ? "default_collection" : "collection") + (this.filter ? "_filter" : ""),
      iconPath: {
        light: path.join(
          __filename,
          "..",
          "..",
          "images/light",
          this.filter ? "filter.svg" : "documents-icon.svg"
        ),
        dark: path.join(
          __filename,
          "..",
          "..",
          "images/dark",
          this.filter ? "filter.svg" : "documents-icon.svg"
        ),
      },
    };
  }

  public async getChildren(): Promise<INode[]> {
    let documentList: INode[] = [];
    // Index directory to contains list of indexes
    const indexItem = new IndexDirectory(
      this,
      this.connection,
      "Indexes",
      this.bucketName,
      this.scopeName,
      this.collectionName,
      [],
      vscode.TreeItemCollapsibleState.None
    );

    documentList.push(indexItem);
    documentList.push(new SchemaDirectory(this, this.connection, "Schema", this.bucketName, this.scopeName, this.collectionName));
    // TODO: default limit could be managed as user settings / preference
    let result;
    // A primary index is required for database querying. If one is present, a result will be obtained.
    // If not, the user will be prompted to create a primary index before querying.
    let docFilter = Memory.state.get<IFilterDocuments>(`filterDocuments-${this.connection.connectionIdentifier}-${this.bucketName}-${this.scopeName}-${this.collectionName}`);
    let filter: string = "";
    if (docFilter && docFilter.filter.length > 0) {
      filter = docFilter.filter;
    }
    const connection = getActiveConnection();
    try {
      result = await connection?.cluster?.query(
        `SELECT RAW META().id FROM \`${this.bucketName}\`.\`${this.scopeName}\`.\`${this.collectionName}\` ${filter.length > 0 ? "WHERE " + filter : ""} LIMIT ${this.limit}`
      );
    } catch (err) {
      if (err instanceof PlanningFailureError) {
        const infoNode: InformationNode = new InformationNode("No indexes available, click to create one", "No indexes available to list the documents in this collection", Commands.checkAndCreatePrimaryIndex, this);
        documentList.push(infoNode);
      }
    }
    result?.rows.forEach((documentName: string) => {
      const documentTreeItem = new DocumentNode(
        this,
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
    if (documentList.length === 1) { // Checking with 1 as Schema Directory is always present
      documentList.push(new InformationNode("No Documents found"));
    } else if (this.documentCount > documentList.length) {
      documentList.push(new PagerNode(this));
    }
    return documentList;
  }
}
