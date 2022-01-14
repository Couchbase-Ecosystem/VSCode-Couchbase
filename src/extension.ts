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
import { ClusterConnectionNode } from "./model/ClusterConnectionNode";
import DocumentNode from "./model/DocumentNode";
import { IConnection } from "./model/IConnection";
import { INode } from "./model/INode";
import { PagerNode } from "./model/PagerNode";
import ClusterConnectionTreeProvider from "./tree/ClusterConnectionTreeProvider";
import { addConnection, useConnection } from "./util/connections";
import { Constants } from "./util/constants";
import { MemFS } from "./util/fileSystemProvider";
import { getDocument, saveDocument } from "./util/requests";
import { Global, Memory, WorkSpace } from "./util/util";

export function activate(context: vscode.ExtensionContext) {
  Global.setState(context.globalState);
  WorkSpace.setState(context.workspaceState);
  Memory.setState();
  Memory.state.update(
    "vscode-couchbase",
    vscode.workspace.getConfiguration("vscode-couchbase")
  );

  const subscriptions = context.subscriptions;

  const clusterConnectionTreeProvider = new ClusterConnectionTreeProvider(
    context
  );

  subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      if (document.languageId === "json" && document.uri.scheme === "couchbase") {
        const activeConnection = Memory.state.get<IConnection>("activeConnection");
        if (!activeConnection) {
          return;
        }

        saveDocument(activeConnection, document).then(() =>
          vscode.window.showInformationMessage("Document saved")
        );
      }
    })
  );

  const memFs = new MemFS();
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("couchbase", memFs, {
      isCaseSensitive: true,
    })
  );

  subscriptions.push(
    vscode.window.registerTreeDataProvider(
      "couchbase",
      clusterConnectionTreeProvider
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.createClusterConnection",
      async () => {
        await addConnection();
        clusterConnectionTreeProvider.refresh();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.deleteClusterConnection",
      async (connection: ClusterConnectionNode | undefined) => {
        if (connection) {
          await connection.deleteConnection(
            context,
            clusterConnectionTreeProvider
          );
          clusterConnectionTreeProvider.refresh();
          return;
        }
        Global.state.update(Constants.connectionKeys, {});
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.refreshConnection",
      (node: INode) => {
        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.useClusterConnection",
      async (connection: ClusterConnectionNode) => {
        await useConnection(connection);
        clusterConnectionTreeProvider.refresh(connection);
        const previousConnection =
          Memory.state.get<INode>("previousConnection");
        if (previousConnection) {
          clusterConnectionTreeProvider.refresh(previousConnection);
        }
        Memory.state.update("previousConnection", connection);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.openDocument",
      async (documentNode: DocumentNode) => {
        try {
          let documentData = await getDocument(documentNode);
          const uri = vscode.Uri.parse(`couchbase:/${documentNode.documentName}.json`);
          memFs.writeFile(
            uri,
            Buffer.from(JSON.stringify(documentData, null, 2)),
            { create: true, overwrite: true }
          );
          const document = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(document, { preview: false });
          return true;
        } catch (err: any) {
          console.log(err);
        }
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.loadMore",
      async (node: PagerNode) => {
        console.log("load more called");
        node.collection.limit += 10;
        clusterConnectionTreeProvider.refresh(node.collection);
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
