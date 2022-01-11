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
import { ENDPOINTS } from "../util/endpoints";
import get from "axios";
import { AxiosRequestConfig } from "axios";
import { ScopeNode } from "./ScopeNode";
import DocumentNode from "./DocumentNode";

export class BucketNode implements INode {
  constructor(
    private readonly connection: IConnection,
    private readonly bucket: string,
    private readonly isScopesandCollections: boolean,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {}

  public getTreeItem(): vscode.TreeItem {
    return {
      label: `${this.bucket}`,
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      contextValue: "database",
      iconPath: {
        light: path.join(__filename, "..", "..", "images/light", "bucket-icon.svg"),
        dark: path.join(__filename, "..", "..", "images/dark", "bucket-icon.svg"),
      } 
    };
  }

  public async getChildren(): Promise<INode[]> {
    if (this.isScopesandCollections) {
      try {
        const options: AxiosRequestConfig = {
          auth: {
            username: this.connection.username,
            password: this.connection.password ? this.connection.password : "",
          },
        };

        const scopeResponse = await get(
          `${this.connection.url}${ENDPOINTS.GET_POOLS}/${this.bucket}/scopes`,
          options
        );

        let scopeList: ScopeNode[] = [];
        scopeResponse.data.scopes.forEach((scope: any) => {
          const scopeTreeItem = new ScopeNode(
            this.connection,
            scope.name,
            this.bucket,
            scope.collections,
            vscode.TreeItemCollapsibleState.None
          );
          scopeList.push(scopeTreeItem);
        });

        return scopeList;
      } catch (err: any) {
        console.log(err);
        throw new Error(err);
      }
    }

    try {
      const options: AxiosRequestConfig = {
        auth: {
          username: this.connection.username,
          password: this.connection.password ? this.connection.password : "",
        },
      };

      const documentResponse = await get(
        `${this.connection.url}${ENDPOINTS.GET_POOLS}/${this.bucket}/docs`,
        options
      );

      let documentList: DocumentNode[] = [];
      documentResponse.data.rows.forEach((document: any) => {
        const documentTreeItem = new DocumentNode(
          document.id,
          this.connection,
          "",
          this.bucket,
          "",
          this.isScopesandCollections,
          vscode.TreeItemCollapsibleState.None
        );
        documentList.push(documentTreeItem);
      });
      return documentList;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }
}
