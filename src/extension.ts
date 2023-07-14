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
import { createCollection, removeCollection } from "./commands/collections";
import { createScope, removeScope } from "./commands/scopes";
import { getBucketMetaData } from "./commands/buckets/getBucketMetaData";

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
      Commands.refreshCollection,
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
      Commands.createScope,
      async (node: BucketNode) => {
        await createScope(node);
        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.removeScope,
      async (node: ScopeNode) => {
        await removeScope(node);
        clusterConnectionTreeProvider.refresh();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.refreshScopes,
      async (node: BucketNode) => {
        clusterConnectionTreeProvider.refresh(node);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.createCollection,
      async (node: CollectionDirectory) => {
        await createCollection(node);
        clusterConnectionTreeProvider.refresh();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.removeCollection,
      async (node: CollectionNode) => {
        await removeCollection(node);
        clusterConnectionTreeProvider.refresh();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.refreshCollections,
      async (node: ScopeNode) => {
        clusterConnectionTreeProvider.refresh(node);
        clusterConnectionTreeProvider.refresh(node.parentNode);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.getBucketMetaData,
      async (node: BucketNode) => {
        getBucketMetaData(node, context);
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
      Commands.openQueryNotebook,
      async () => {
        createNotebook();
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      Commands.openQueryWorkbench,
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
