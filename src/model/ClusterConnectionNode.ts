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
import * as keytar from "keytar";

import { Memory } from "../util/util";

import { IConnection } from "./IConnection";
import { INode } from "./INode";
import { Constants } from "../util/constants";
import ClusterConnectionTreeProvider from "../tree/ClusterConnectionTreeProvider";
import { BucketNode } from "./BucketNode";
import { ENDPOINTS } from "../util/endpoints";

import get, { AxiosRequestConfig } from "axios";
import { BucketSettings } from "couchbase";

export class ClusterConnectionNode implements INode {
  constructor(
    private readonly id: string,
    private readonly connection: IConnection
  ) {}
  public connectToNode() {
    const connection = { ...this.connection };
    Memory.state.update("activeConnection", connection);
    return this.id;
  }

  public getTreeItem(): vscode.TreeItem {
    let id = `${this.connection.connectionIdentifier}`;
    if (!id) {
      id = `${this.connection.username}@${this.connection.url.substring(this.connection.url.lastIndexOf("://") + 3)}`;
    }

    const activeConnection = Memory.state.get<IConnection>("activeConnection");
    return {
      label: this.equalsConnection(activeConnection) ? `${id}` : id,
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      contextValue: "connection",
      iconPath: {
        light: path.join(__filename, "..", "..", "images", this.equalsConnection(activeConnection) ? "": "light", "cb-logo-icon.svg"),
        dark: path.join(__filename, "..", "..", "images", this.equalsConnection(activeConnection) ? "": "dark", "cb-logo-icon.svg"),
      }
    };
  }

  private equalsConnection(activeConnection: IConnection | undefined): Boolean {
    if (!activeConnection) {
      return false;
    }
    if (this.connection.url !== activeConnection.url) {
      return false;
    }
    if (this.connection.username !== activeConnection.username) {
      return false;
    }
    return true;
  }

  public async getChildren(): Promise<INode[]> {
    let isScopesandCollections = true;
    try {
      const options: AxiosRequestConfig = {
        auth: {
          username: this.connection.username,
          password: this.connection.password ? this.connection.password : "",
        },
      };

      const clusterResponse = await get(
        `${this.connection.url}${ENDPOINTS.GET_CLUSTER}`,
        options
      );
      if (parseInt(clusterResponse.data.implementationVersion[0]) <= 6) {
        isScopesandCollections = false;
      }
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }

    const nodes: INode[] = [];
    try {
      let buckets = await this.connection.cluster?.buckets().getAllBuckets();
      buckets?.forEach((bucket: BucketSettings) => {
        nodes.push(new BucketNode(
          this.connection,
          bucket.name,
          isScopesandCollections,
          vscode.TreeItemCollapsibleState.None
        ));
      });
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }

    return nodes;
  }

  public async deleteConnection(
    context: vscode.ExtensionContext,
    treeProvider: ClusterConnectionTreeProvider
  ) {
    const connections = context.globalState.get<{ [key: string]: IConnection }>(
      Constants.connectionKeys
    );
    if (connections) {
      delete connections[this.id];
    }
    await context.globalState.update(Constants.connectionKeys, connections);

    await keytar.deletePassword(Constants.extensionID, this.id);

    treeProvider.refresh();
  }
}
