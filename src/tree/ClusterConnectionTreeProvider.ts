/*
 *     Copyright 2021 Couchbase, Inc.
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
import * as keytar from "keytar";
import { IConnection } from "../model/IConnection";
import { Constants } from "../util/constants";
import { Global, Memory } from "../util/util";
import { INode } from "../model/INode";
import { ClusterConnectionNode } from "../model/ClusterConnectionNode";

export default class ClusterConnectionTreeProvider
  implements vscode.TreeDataProvider<INode>
{
  constructor(private context: vscode.ExtensionContext) {}
  private _onDidChangeTreeData: vscode.EventEmitter<
    INode | undefined | null | void
  > = new vscode.EventEmitter<INode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<INode | undefined | null | void> =
    this._onDidChangeTreeData.event;

  getTreeItem(element: INode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element.getTreeItem();
  }
  getChildren(element?: INode): vscode.ProviderResult<INode[]> {
    if (!element) {
      return this.getActiveConnections();
    }
    return element.getChildren();
  }

  public refresh(element?: INode): void {
    this._onDidChangeTreeData.fire(element);
  }

  private async getActiveConnections(): Promise<ClusterConnectionNode[]> {
    const connections = Global.state.get<{ [key: string]: IConnection }>(
      Constants.connectionKeys
    );
    const connectionNodes = [];
    if (connections) {
      for (const id of Object.keys(connections)) {
        const password =
          (await keytar.getPassword(Constants.extensionID, id)) || "";
        const connectionNode = new ClusterConnectionNode(id, {
          ...connections[id],
          password,
        });
        connectionNodes.push(connectionNode);
        const activeConnection = Memory.state.get("activeConnection");
        if (!activeConnection) {
          vscode.commands.executeCommand(
            "vscode-couchbase.useClusterConnection",
            connectionNode
          );
        }
      }
    }
    return connectionNodes;
  }
}
