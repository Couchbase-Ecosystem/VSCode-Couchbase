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
import { BucketNode } from "./model/BucketNode";
import { ClusterConnectionNode } from "./model/ClusterConnectionNode";
import CollectionNode from "./model/CollectionNode";
import DocumentNode from "./model/DocumentNode";
import { DocumentNotFoundError } from "couchbase";
import { IConnection } from "./model/IConnection";
import { INode } from "./model/INode";
import { PagerNode } from "./model/PagerNode";
import { ScopeNode } from "./model/ScopeNode";
import { getBucketMetaData } from "../src/webViews/webViewProvider";
import ClusterConnectionTreeProvider from "./tree/ClusterConnectionTreeProvider";
import {
  addConnection,
  getActiveConnection,
  removeConnection,
  setActiveConnection,
  useConnection,
} from "./util/connections";
import { MemFS } from "./util/fileSystemProvider";
import { Global, Memory, WorkSpace } from "./util/util";
import { IBucket } from "./model/IBucket";

export function activate(context: vscode.ExtensionContext) {
  Global.setState(context.globalState);
  WorkSpace.setState(context.workspaceState);
  Memory.setState();
  Memory.state.update(
    "vscode-couchbase",
    vscode.workspace.getConfiguration("vscode-couchbase")
  );
  const uriToCasMap = new Map<string, string>();
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  const subscriptions = context.subscriptions;

  const clusterConnectionTreeProvider = new ClusterConnectionTreeProvider(
    context
  );

  subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(
      async (document: vscode.TextDocument) => {
        if (
          document.languageId === "json" &&
          document.uri.scheme === "couchbase"
        ) {
          const activeConnection = getActiveConnection();
          if (!activeConnection) {
            return;
          }

          const parts = document.uri.path.substring(1).split("/");
          const bucket = parts[0],
            scope = parts[1],
            collection = parts[2],
            name = parts[3].substring(0, parts[3].indexOf(".json"));
          const currentDocument = await activeConnection.cluster?.bucket(bucket)
          .scope(scope)
          .collection(collection)
          .get(name);
          if(currentDocument.cas.toString() !== uriToCasMap.get(document.uri.toString())) {
            const answer = await vscode.window.showWarningMessage(
              "There is a conflict while trying to save this document, as it was also changed in the server. Would you like to load the server version or overwrite the remote version with your changes?",
              { modal: true },
              "Remove changes and Load Server Version",
              "Overwrite this Version"
            );
            if(answer === "Remove changes and Load Server Version")
            {
              memFs.writeFile(
                document.uri,
                Buffer.from(JSON.stringify(currentDocument?.content, null, 2)),
                { create: true, overwrite: true }
              );
              uriToCasMap.set(document.uri.toString(), currentDocument.cas.toString());
              return;
            }
          }
          const result =  await activeConnection.cluster
            ?.bucket(bucket)
            .scope(scope)
            .collection(collection)
            .upsert(name, JSON.parse(document.getText()));
            vscode.window.setStatusBarMessage("Document saved", 2000);
          uriToCasMap.set(document.uri.toString(), result.cas.toString());
          clusterConnectionTreeProvider.refresh();
        }
      }
    )
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
      async (node: ClusterConnectionNode) => {
        await removeConnection(node.connection);
        clusterConnectionTreeProvider.refresh();
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
      async (node: ClusterConnectionNode) => {
        await useConnection(node.connection);
        clusterConnectionTreeProvider.refresh();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.disconnectClusterConnection",
      async (node: ClusterConnectionNode) => {
        if (!node.isActive) {
          return;
        }
        node.connection.cluster = undefined;
        setActiveConnection();
        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.openDocument",
      async (documentNode: DocumentNode) => {
        try {
          const result = await documentNode.connection.cluster
            ?.bucket(documentNode.bucketName)
            .scope(documentNode.scopeName)
            .collection(documentNode.collectionName)
            .get(documentNode.documentName);
          const uri = vscode.Uri.parse(
            `couchbase:/${documentNode.bucketName}/${documentNode.scopeName}/${documentNode.collectionName}/${documentNode.documentName}.json`
          );
          uriToCasMap.set(uri.toString(), result.cas.toString());
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
    vscode.commands.registerCommand(
      "vscode-couchbase.createDocument",
      async (node: CollectionNode) => {
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
          vscode.window.showErrorMessage("Document name is required.");
          return;
        }

        const uri = vscode.Uri.parse(
          `couchbase:/${node.bucketName}/${node.scopeName}/${node.collectionName}/${documentName}.json`
        );
        let documentContent = Buffer.from("{}");
        // Try block is trying to retrieve the document with the same key first
        // If returns an error go to catch block create a new empty document
        try {
          const result = await node.connection.cluster
            ?.bucket(node.bucketName)
            .scope(node.scopeName)
            .collection(node.collectionName)
            .get(documentName);
          documentContent = Buffer.from(
            JSON.stringify(result?.content, null, 2)
          );
        } catch (err: any) {
          if (!(err instanceof DocumentNotFoundError)) {
            console.log(err);
          }
        }
        memFs.writeFile(uri, documentContent, {
          create: true,
          overwrite: true,
        });
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document, { preview: false });

        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.removeDocument",
      async (node: DocumentNode) => {
        const connection = Memory.state.get<IConnection>("activeConnection");
        if (!connection) {
          return;
        }

        let answer = await vscode.window.showInformationMessage(
          "Do you want to do this?",
          ...["Yes", "No"]
        );
        if (answer !== "Yes") {
          return;
        }
        await connection.cluster
          ?.bucket(node.bucketName)
          .scope(node.scopeName)
          .collection(node.collectionName)
          .remove(node.documentName);

        const uri = vscode.Uri.parse(
          `couchbase:/${node.bucketName}/${node.scopeName}/${node.collectionName}/${node.documentName}.json`
        );
        memFs.delete(uri);

        clusterConnectionTreeProvider.refresh();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.refreshCollection",
      async (node: CollectionNode) => {
        const connection = Memory.state.get<IConnection>("activeConnection");
        if (!connection) {
          return;
        }

        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.createScope",
      async (node: BucketNode) => {
        const connection = Memory.state.get<IConnection>("activeConnection");
        if (!connection) {
          return;
        }

        const scopeName = await vscode.window.showInputBox({
          prompt: "Scope name",
          placeHolder: "scope name",
          ignoreFocusOut: true,
          value: "",
        });
        if (!scopeName) {
          vscode.window.showErrorMessage("Scope name is required.");
          return;
        }

        const collectionManager = await node.connection.cluster
          ?.bucket(node.bucketName)
          .collections();
        await collectionManager?.createScope(scopeName);

        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.removeScope",
      async (node: ScopeNode) => {
        const connection = Memory.state.get<IConnection>("activeConnection");
        if (!connection) {
          return;
        }

        let answer = await vscode.window.showInformationMessage(
          "Do you want to do this?",
          ...["Yes", "No"]
        );
        if (answer !== "Yes") {
          return;
        }

        const collectionManager = await node.connection.cluster
          ?.bucket(node.bucketName)
          .collections();
        await collectionManager?.dropScope(node.scopeName);

        clusterConnectionTreeProvider.refresh();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.refreshScopes",
      async (node: BucketNode) => {
        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.createCollection",
      async (node: ScopeNode) => {
        const connection = Memory.state.get<IConnection>("activeConnection");
        if (!connection) {
          return;
        }

        const collectionName = await vscode.window.showInputBox({
          prompt: "Collection name",
          placeHolder: "collection name",
          ignoreFocusOut: true,
          value: "",
        });
        if (!collectionName) {
          vscode.window.showErrorMessage("Collection name is required.");
          return;
        }

        const collectionManager = await node.connection.cluster
          ?.bucket(node.bucketName)
          .collections();
        await collectionManager?.createCollection({
          name: collectionName,
          scopeName: node.scopeName,
        });

        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.removeCollection",
      async (node: CollectionNode) => {
        const connection = Memory.state.get<IConnection>("activeConnection");
        if (!connection) {
          return;
        }

        let answer = await vscode.window.showInformationMessage(
          "Do you want to do this?",
          ...["Yes", "No"]
        );
        if (answer !== "Yes") {
          return;
        }

        const collectionManager = await node.connection.cluster
          ?.bucket(node.bucketName)
          .collections();
        await collectionManager?.dropCollection(
          node.collectionName,
          node.scopeName
        );

        clusterConnectionTreeProvider.refresh();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.refreshCollections",
      async (node: ScopeNode) => {
        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.getBucketInfo",
      async (node: BucketNode) => {
        const connection = Memory.state.get<IConnection>("activeConnection");

        if (!connection) {
          return;
        }
        try {
          const viewType = connection.url + "." + node.bucketName;
          const bucketData: IBucket = await connection.cluster
            ?.buckets()
            .getBucket(node.bucketName);
          if (currentPanel && currentPanel.viewType === viewType) {
            currentPanel.webview.html = getBucketMetaData(bucketData);
            currentPanel.reveal(vscode.ViewColumn.One);
          } else {
            currentPanel = vscode.window.createWebviewPanel(
              viewType,
              node.bucketName,
              vscode.ViewColumn.One,
              {
                enableScripts: true,
              }
            );
            currentPanel.webview.html = getBucketMetaData(bucketData);

            currentPanel.onDidDispose(
              () => {
                currentPanel = undefined;
              },
              undefined,
              context.subscriptions
            );
          }
        } catch {
          console.log(
            `Error: Bucket metadata retrieval failed for \`${node.bucketName}\``
          );
        }
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.searchDocument",
      async (node: CollectionNode) => {
        const connection = Memory.state.get<IConnection>("activeConnection");
        if (!connection) {
          return;
        }
        const documentName = await vscode.window.showInputBox({
          prompt: "Please enter the Document ID",
          placeHolder: "Document Id",
          ignoreFocusOut: true,
          value: "",
        });
        if (!documentName) {
          vscode.window.showErrorMessage("Document name is required.");
          return;
        }
        try {
          const result = await node.connection.cluster
            ?.bucket(node.bucketName)
            .scope(node.scopeName)
            .collection(node.collectionName)
            .get(documentName);
          const uri = vscode.Uri.parse(
            `couchbase:/${node.bucketName}/${node.scopeName}/${node.collectionName}/${documentName}.json`
          );
          memFs.writeFile(
            uri,
            Buffer.from(JSON.stringify(result?.content, null, 2)),
            { create: true, overwrite: true }
          );
          const document = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(document, { preview: false });
          return true;
        } catch (err) {
          if (err instanceof DocumentNotFoundError) {
            vscode.window.showErrorMessage(
              "The document with document Id " +
                documentName +
                " does not exist",
              { modal: true }
            );
          } else {
            console.log(
              `Error: An error occured while retrieving document with document Id ${documentName}: ${err}`
            );
          }
        }
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
