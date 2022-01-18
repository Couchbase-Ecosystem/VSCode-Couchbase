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
import CollectionNode from "./model/CollectionNode";
import DocumentNode from "./model/DocumentNode";
import { IConnection } from "./model/IConnection";
import { INode } from "./model/INode";
import { PagerNode } from "./model/PagerNode";
import ClusterConnectionTreeProvider from "./tree/ClusterConnectionTreeProvider";
import { addConnection, useConnection } from "./util/connections";
import { Constants } from "./util/constants";
import { MemFS } from "./util/fileSystemProvider";
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
    vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
      if (document.languageId === "json" && document.uri.scheme === "couchbase") {
        const activeConnection = Memory.state.get<IConnection>("activeConnection");
        if (!activeConnection) {
          return;
        }

        const parts = document.uri.path.substring(1).split('/');
        const bucket = parts[0],
              scope = parts[1],
              collection = parts[2],
              name = parts[3].substring(0, parts[3].indexOf(".json"))
        await activeConnection.cluster?.bucket(bucket).scope(scope).collection(collection).upsert(name, JSON.parse(document.getText()));
        vscode.window.showInformationMessage("Document saved");

        // TODO: refresh collection to show new docs
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
          const result = await documentNode.connection.cluster?.bucket(documentNode.bucketName).scope(documentNode.scopeName).collection(documentNode.collectionName).get(documentNode.documentName);
          const uri = vscode.Uri.parse(`couchbase:/${documentNode.bucketName}/${documentNode.scopeName}/${documentNode.collectionName}/${documentNode.documentName}.json`);
          memFs.writeFile(
            uri,
            Buffer.from(JSON.stringify(result?.content, null, 2)),
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

  subscriptions.push(
    vscode.commands.registerCommand("vscode-couchbase.createDocument", async (node: CollectionNode) => {
      const connection = Memory.state.get<IConnection>("activeConnection");
      if (!connection) {
        return;
      }

      const documentName = await vscode.window.showInputBox({
        prompt: "Document name",
        placeHolder: "name",
        ignoreFocusOut: true,
        value: "",
      });
      if (!documentName) {
        vscode.window.showErrorMessage('Document name is required.');
        return;
      }

      const uri = vscode.Uri.parse(`couchbase:/${node.bucketName}/${node.scopeName}/${node.collectionName}/${documentName}.json`);
      memFs.writeFile(
        uri,
        Buffer.from("{}"),
        { create: true, overwrite: true }
      );
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document, { preview: false });

      clusterConnectionTreeProvider.refresh(node);
    })
  );

  subscriptions.push(
    vscode.commands.registerCommand("vscode-couchbase.removeDocument", async (node: DocumentNode) => {
      const connection = Memory.state.get<IConnection>("activeConnection");
      if (!connection) {
        return;
      }

      let answer = await vscode.window.showInformationMessage("Do you want to do this?", ...["Yes", "No"]);
      if (answer !== "Yes") {
        return;
      }
      await connection.cluster?.bucket(node.bucketName).scope(node.scopeName).collection(node.collectionName).remove(node.documentName);

      const uri = vscode.Uri.parse(`couchbase:/${node.bucketName}/${node.scopeName}/${node.collectionName}/${node.documentName}.json`);
      memFs.delete(uri);

      // TODO: refresh collection
    })
  );

  subscriptions.push(
    vscode.commands.registerCommand("vscode-couchbase.refreshCollection", async (node: CollectionNode) => {
      const connection = Memory.state.get<IConnection>("activeConnection");
      if (!connection) {
        return;
      }

      clusterConnectionTreeProvider.refresh(node);
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
