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
import { IConnection } from "./types/IConnection";
import { INode } from "./types/INode";
import { logger } from "./logger/logger";
import { PagerNode } from "./model/PagerNode";
import { ScopeNode } from "./model/ScopeNode";
import { getBucketMetaDataView } from "./webViews/metaData.webview";
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
import { IDocumentData } from "./types/IDocument";
import { QueryContentSerializer } from "./notebook/serializer";
import { QueryKernel } from "./notebook/controller";
import { Constants } from "./util/constants";
import { createNotebook } from "./notebook/notebook";
import IndexNode from "./model/IndexNode";
import { CollectionDirectory } from "./model/CollectionDirectory";
import { IndexDirectory } from "./model/IndexDirectory";
import { extractDocumentInfo } from "./util/common";
import { openWorkbench } from "./workbench/workbench";
import { updateDocumentToServer } from "./util/documentUtils/updateDocument";
import { getDocument } from "./util/documentUtils/getDocument";
import { openIndexInfo } from "./commands/indexes/openIndexInformation";
import { Commands } from "./commands/extensionCommands/commands";
import { createDocument, removeDocument, searchDocument, getDocumentMetaData, openDocument } from "./commands/documents";
import { getSampleProjects } from "./commands/sampleProjects/getSampleProjects";

export function activate(context: vscode.ExtensionContext) {
  Global.setState(context.globalState);
  WorkSpace.setState(context.workspaceState);
  Memory.setState();
  Memory.state.update(
    "vscode-couchbase",
    vscode.workspace.getConfiguration("vscode-couchbase")
  );
  logger.info(`Activating extension ${Constants.extensionID} v${Constants.extensionVersion}`);
  const uriToCasMap = new Map<string, string>();
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  const subscriptions = context.subscriptions;

  const clusterConnectionTreeProvider = new ClusterConnectionTreeProvider(
    context
  );

  // Set up the global error handler
  process.on('uncaughtException', (error) => {
    logger.error(`Unhandled error: ${error.message}`);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(reason instanceof Error ? `${reason.message}` : reason);
  });

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.showOutputConsole,
      () => {
        logger.showOutput();
      }
    )
  );

  /**
 * handleActiveEditorConflict function handles conflicts between the local version of an open document in Visual Studio Code
 * and the server version of the same document. A modal dialog is displayed asking the user to load the server version or keep
 * the local version.
 *
 * @param document vscode.TextDocument object representing the open document
 * @param remoteDocument The updated version of the document from the server
 */
  const handleActiveEditorConflict = async (document: vscode.TextDocument, remoteDocument: any) => {
    const answer = await vscode.window.showWarningMessage(
      "Conflict Alert: A change has been detected in the server version of this document. To ensure that you are working with the most up-to-date version, would you like to load the server version?",
      { modal: true },
      "Load Server Version",
      "Keep Local Version"
    );
    if (answer === "Load Server Version") {
      memFs.writeFile(
        document.uri,
        Buffer.from(JSON.stringify(remoteDocument?.content, null, 2)),
        { create: true, overwrite: true }
      );
      uriToCasMap.set(document.uri.toString(), remoteDocument.cas.toString());
      clusterConnectionTreeProvider.refresh();
    }
  };

  /**
 * Handles a save conflict for a TextDocument by showing a warning message to the user,
 * offering the choice to either discard local changes and load the server version or
 * overwrite the remote version with local changes.
 *
 * @param remoteDocument The current version of the document in the server
 * @param document The TextDocument being saved
 * @param activeConnection The active connection object
 * @param documentInfo The information about the document being saved
 */
  const handleSaveTextDocumentConflict = async (
    remoteDocument: any,
    document: vscode.TextDocument,
    activeConnection: IConnection,
    documentInfo: IDocumentData
  ) => {
    const answer = await vscode.window.showWarningMessage(
      "Conflict Alert: There is a conflict while trying to save this document, as it was also changed in the server. Would you like to load the server version or overwrite the remote version with your changes?",
      { modal: true },
      "Discard Local Changes and Load Server Version",
      "Overwrite Server Version with Local Changes"
    );
    if (answer === "Discard Local Changes and Load Server Version") {
      memFs.writeFile(
        document.uri,
        Buffer.from(JSON.stringify(remoteDocument?.content, null, 2)),
        { create: true, overwrite: true }
      );
      uriToCasMap.set(document.uri.toString(), remoteDocument.cas.toString());
    } else if (answer === "Overwrite Server Version with Local Changes") {
      const cas = await updateDocumentToServer(
        activeConnection,
        documentInfo,
        document
      );
      if (cas !== "") {
        vscode.window.setStatusBarMessage("Document saved", 2000);
        uriToCasMap.set(document.uri.toString(), cas);
      }
    }
  };

  subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      if (!editor) {
        return;
      }
      if (
        editor.document.languageId === "json" &&
        editor.document.uri.scheme === "couchbase"
      ) {
        const activeConnection = getActiveConnection();
        if (!activeConnection) {
          return;
        }
        const documentInfo: IDocumentData = extractDocumentInfo(
          editor.document.uri.path
        );
        try {
          const remoteDocument = await getDocument(
            activeConnection,
            documentInfo
          );
          // The condition below is checking whether the remoteDocument object exists and whether there is
          // a Cas value associated with the URI. Furthermore, it's verifying whether the Cas value
          // in the remoteDocument has been modified since the last time it was saved.
          if (
            remoteDocument &&
            uriToCasMap.get(editor.document.uri.toString()) &&
            remoteDocument.cas.toString() !==
            uriToCasMap.get(editor.document.uri.toString())
          ) {
            handleActiveEditorConflict(editor.document, remoteDocument);
          }
        } catch (err) {
          if (err instanceof DocumentNotFoundError) {
            return;
          }
          logger.error(err);
        }
      }
    })
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
          const documentInfo = await extractDocumentInfo(document.uri.path);
          let remoteDocument = undefined;
          try {
            remoteDocument = await getDocument(activeConnection, documentInfo);
          }
          catch (err) {
            if (!(err instanceof DocumentNotFoundError)) {
              return;
            }
          }
          if (remoteDocument && remoteDocument.cas.toString() !== uriToCasMap.get(document.uri.toString())) {
            handleSaveTextDocumentConflict(remoteDocument, document, activeConnection, documentInfo);
          } else {
            const cas = await updateDocumentToServer(activeConnection, documentInfo, document);
            if (cas !== "") {
              vscode.window.setStatusBarMessage("Document saved", 2000);
              uriToCasMap.set(document.uri.toString(), cas);
            }
            vscode.window.setStatusBarMessage("Document saved", 2000);
            logger.info(`Document with id ${documentInfo.name} has been updated`);
            uriToCasMap.set(document.uri.toString(), cas);
            clusterConnectionTreeProvider.refresh();
          }
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
      Commands.createClusterConnection,
      async () => {
        await addConnection(clusterConnectionTreeProvider);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.deleteClusterConnection,
      async (node: ClusterConnectionNode) => {
        if (node.isActive) {
          node.connection.cluster = undefined;
          setActiveConnection();
        }
        await removeConnection(node.connection);
        clusterConnectionTreeProvider.refresh();
        logger.info(`Connection named ${node.connection.connectionIdentifier} has been deleted.`);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.refreshConnection,
      (node: INode) => {
        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.useClusterConnection,
      async (node: ClusterConnectionNode) => {
        await useConnection(node.connection);
        clusterConnectionTreeProvider.refresh();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.disconnectClusterConnection,
      async (node: ClusterConnectionNode) => {
        if (!node.isActive) {
          return;
        }
        node.connection.cluster = undefined;
        setActiveConnection();
        clusterConnectionTreeProvider.refresh(node);
        logger.info(`Connection to ${node.connection.connectionIdentifier} has been disconnection`);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.openDocument,
      async (documentNode: DocumentNode) => {
        await openDocument(documentNode, clusterConnectionTreeProvider, uriToCasMap, memFs);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.openIndexInfo,
      async (indexNode: IndexNode) => {
        openIndexInfo(indexNode, memFs);

      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.loadMore,
      async (node: PagerNode) => {
        node.collection.limit += 10;
        clusterConnectionTreeProvider.refresh(node.collection);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.createDocument,
      async (node: CollectionNode) => {
        await createDocument(node, memFs, uriToCasMap);
        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.removeDocument,
      async (node: DocumentNode) => {
        await removeDocument(node, uriToCasMap, memFs);
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
        if (scopeName.startsWith('_' || scopeName.startsWith('%'))) {
          vscode.window.showErrorMessage(`Scope names cannot start with ${scopeName[0]}`);
          return;
        }

        const collectionManager = await node.connection.cluster
          ?.bucket(node.bucketName)
          .collections();
        await collectionManager?.createScope(scopeName);
        logger.info(`${node.bucketName}: Successfully created the scope: ${scopeName}`);
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
          `Are you sure you want to delete the scope ${node.scopeName}?`,
          ...["Yes", "No"]
        );
        if (answer !== "Yes") {
          return;
        }

        const collectionManager = await node.connection.cluster
          ?.bucket(node.bucketName)
          .collections();
        await collectionManager?.dropScope(node.scopeName);
        logger.info(`${node.bucketName}: The scope named ${node.scopeName} has been deleted`);
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
      async (node: CollectionDirectory) => {
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
        if (collectionName.startsWith('%') || collectionName.startsWith('_')) {
          vscode.window.showErrorMessage(`Collection names cannot start with ${collectionName[0]}`);
          return;
        }

        const collectionManager = await node.connection.cluster
          ?.bucket(node.bucketName)
          .collections();
        await collectionManager?.createCollection({
          name: collectionName,
          scopeName: node.scopeName,
        });

        logger.info(`${node.bucketName}: ${node.scopeName}: Successfully created the collection: ${collectionName}`);
        clusterConnectionTreeProvider.refresh();
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
          `Are you sure you want to delete the collection ${node.collectionName}?`,
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
        logger.info(`${node.bucketName}: ${node.scopeName}: The collection named ${node.collectionName} has been deleted`);

        clusterConnectionTreeProvider.refresh();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.refreshCollections",
      async (node: ScopeNode) => {
        clusterConnectionTreeProvider.refresh(node);
        clusterConnectionTreeProvider.refresh(node.parentNode);
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
          const viewType = `${connection.url}.${node.bucketName}`;
          const bucketData = await connection.cluster
            ?.buckets()
            .getBucket(node.bucketName);
          if (!bucketData) {
            return;
          }
          if (currentPanel && currentPanel.viewType === viewType) {
            currentPanel.webview.html = getBucketMetaDataView(bucketData);
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
            currentPanel.webview.html = getBucketMetaDataView(bucketData);

            currentPanel.onDidDispose(
              () => {
                currentPanel = undefined;
              },
              undefined,
              context.subscriptions
            );
          }
        } catch (err) {
          logger.error(
            `Bucket metadata retrieval failed for \`${node.bucketName}\``
          );
          logger.debug(err);
        }
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.getDocumentMetaData,
      async (node: DocumentNode) => {
        getDocumentMetaData(node, context);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.searchDocument,
      async (node: CollectionNode) => {
        await searchDocument(node, uriToCasMap, memFs);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.refreshIndexes,
      async (node: IndexDirectory) => {
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
      "vscode-couchbase.openQueryNotebook",
      async () => {
        createNotebook();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.openQueryWorkbench",
      async (node: ClusterConnectionNode) => {
        const connection = Memory.state.get<IConnection>("activeConnection");

        if (!connection) {
          return;
        }
        openWorkbench(node, context, currentPanel);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(Commands.getSampleProjects, async () => {
      getSampleProjects(context);
    })
  );

  context.subscriptions.push(
    vscode.workspace.registerNotebookSerializer(
      Constants.notebookType, new QueryContentSerializer(), { transientOutputs: true }
    ),
    new QueryKernel()
  );
}

// this method is called when your extension is deactivated
export function deactivate() { }
