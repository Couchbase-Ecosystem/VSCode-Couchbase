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
import { ScopeNode } from "./ScopeNode";
import { ScopeSpec } from "couchbase";
import InformationNode from "./InformationNode";
import { logger } from "../logger/logger";
import { getActiveConnection } from "../util/connections";

export class BucketNode implements INode {
  constructor(
    public readonly parentNode: INode,
    public readonly connection: IConnection,
    public readonly bucketName: string,
    public readonly isScopesandCollections: boolean,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) { }

  public getTreeItem(): vscode.TreeItem {
    return {
      label: `${this.bucketName}`,
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      contextValue: "bucket",
      iconPath: {
        light: path.join(
          __filename,
          "..",
          "..",
          "images/light",
          "bucket-icon.svg"
        ),
        dark: path.join(
          __filename,
          "..",
          "..",
          "images/dark",
          "bucket-icon.svg"
        ),
      },
    };
  }

  public async getChildren(): Promise<INode[]> {
    const nodes: INode[] = [];
    if (this.isScopesandCollections) {
      try {
        const activeConnection = getActiveConnection();
        if (!activeConnection) {
          return nodes;
        };
        let scopes = await activeConnection.cluster
          ?.bucket(this.bucketName)
          .collections()
          .getAllScopes();
        scopes?.forEach((scope: ScopeSpec) => {
          nodes.push(
            new ScopeNode(
              this,
              this.connection,
              scope.name,
              this.bucketName,
              scope.collections,
              vscode.TreeItemCollapsibleState.None
            )
          );
        });
      } catch (err: any) {
        logger.error("Failed to load Scopes");
        logger.debug(err);
        throw new Error(err);
      }
    }
    if (nodes.length === 0) {
      nodes.push(new InformationNode("No scopes found"));
    }

    // TODO: support non scope/collection docs?
    return nodes;
  }
}
