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
import { logger } from "./logging/logger";
import { PagerNode } from "./model/PagerNode";
import { ScopeNode } from "./model/ScopeNode";
import { getBucketMetaData, getDocumentMetaData } from "./webViews/metaData.webview";
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
import { IDocumentData } from "./model/IDocument";
import { QueryContentSerializer } from "./notebook/serializer";
import { QueryKernel } from "./notebook/controller";
import { Constants } from "./util/constants";
import { createNotebook } from "./notebook/notebook";
import { getQueryWorkbench } from "./webViews/workbench.webview";
import IndexNode from "./model/IndexNode";
import { CollectionDirectory } from "./model/CollectionDirectory";
import { IndexDirectory } from "./model/IndexDirectory";
import { extractDocumentInfo } from "./util/common";
import { getSampleProjects } from "./webViews/sampleProjects.webview";
import gitly from "gitly";

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
      "vscode-couchbase.showOutputConsole",
      () => {
        logger.showOutput();
      }
    )
  );

  const getDocument = async (activeConnection: IConnection, documentInfo: IDocumentData) => {
    return await activeConnection.cluster
      ?.bucket(documentInfo.bucket)
      .scope(documentInfo.scope)
      .collection(documentInfo.collection)
      .get(documentInfo.name);
  };

  const updateDocumentToServer = async (activeConnection: IConnection, documentInfo: IDocumentData, document: vscode.TextDocument): Promise<string> => {
    const result = await activeConnection.cluster
      ?.bucket(documentInfo.bucket)
      .scope(documentInfo.scope)
      .collection(documentInfo.collection)
      .upsert(documentInfo.name, JSON.parse(document.getText()));
    vscode.window.setStatusBarMessage("Document saved", 2000);
    if (result && result.cas) {
      return result.cas.toString();
    }
    return "";
  };

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
      "vscode-couchbase.createClusterConnection",
      async () => {
        await addConnection(clusterConnectionTreeProvider);
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.deleteClusterConnection",
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
        logger.info(`Connection to ${node.connection.connectionIdentifier} has been disconnection`);
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
            `couchbase:/${documentNode.bucketName}/${documentNode.scopeName}/Collections/${documentNode.collectionName}/${documentNode.documentName}.json`
          );
          if (result) {
            uriToCasMap.set(uri.toString(), result.cas.toString());
          }
          memFs.writeFile(
            uri,
            Buffer.from(JSON.stringify(result?.content, null, 2)),
            { create: true, overwrite: true }
          );
          const document = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(document, { preview: false });
          return true;
        } catch (err: any) {
          if (err instanceof vscode.FileSystemError && err.name === 'EntryNotFound (FileSystemError)' || err instanceof DocumentNotFoundError) {
            clusterConnectionTreeProvider.refresh();
          }
          logger.error("Failed to open Document");
          logger.debug(err);
        }
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.openIndexInfo",
      async (indexNode: IndexNode) => {
        try {
          const uri = vscode.Uri.parse(
            `couchbase:/${indexNode.bucketName}/${indexNode.scopeName}/Indexes/${indexNode.indexName}.n1ql`
          );
          memFs.writeFile(
            uri,
            Buffer.from(indexNode.data),
            { create: true, overwrite: true }
          );
          const document = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(document, { preview: false });
          return true;
        } catch (err: any) {
          logger.error("Failed to open index information");
          logger.debug(err);
        }
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.loadMore",
      async (node: PagerNode) => {
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
          prompt: "Document Id",
          placeHolder: "Document Id",
          ignoreFocusOut: true,
          value: "",
        });
        if (!documentName) {
          vscode.window.showErrorMessage("Document Id is required.");
          return;
        }

        const uri = vscode.Uri.parse(
          `couchbase:/${node.bucketName}/${node.scopeName}/Collections/${node.collectionName}/${documentName}.json`
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
          if (result) {
            uriToCasMap.set(uri.toString(), result.cas.toString());
          }
          documentContent = Buffer.from(
            JSON.stringify(result?.content, null, 2)
          );
        } catch (err: any) {
          if (!(err instanceof DocumentNotFoundError)) {
            logger.error(err);
          }
        }
        memFs.writeFile(uri, documentContent, {
          create: true,
          overwrite: true,
        });
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document, { preview: false });
        logger.info(`${node.bucketName}: ${node.scopeName}: ${node.collectionName}: Successfully created the document: ${documentName}`);
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
          `Are you sure you want to delete the document ${node.documentName}?`,
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
        try {
          const uri = vscode.Uri.parse(
            `couchbase:/${node.bucketName}/${node.scopeName}/Collections/${node.collectionName}/${node.documentName}.json`
          );
          memFs.delete(uri);
        } catch (err) {
          if (!(err instanceof vscode.FileSystemError)) {
            logger.error(err);
          }
        }
        logger.info(`${node.bucketName}: ${node.scopeName}: ${node.collectionName}: The document named ${node.documentName} has been deleted`);
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
      "vscode-couchbase.getDocumentMetaData",
      async (node: DocumentNode) => {
        const connection = Memory.state.get<IConnection>("activeConnection");

        if (!connection) {
          return;
        }
        try {
          const viewType = `${connection.url}.${node.bucketName}.${node.scopeName}.${node.collectionName}.${node.documentName}`;
          const result = await connection.cluster?.query(
            `SELECT META(b).* FROM \`${node.bucketName}\`.\`${node.scopeName}\`.\`${node.collectionName}\` b WHERE META(b).id =  \"${node.documentName}\"`
          );
          if (currentPanel && currentPanel.viewType === viewType) {
            currentPanel.webview.html = getDocumentMetaData(result?.rows);
            currentPanel.reveal(vscode.ViewColumn.One);
          } else {
            currentPanel = vscode.window.createWebviewPanel(
              viewType,
              node.documentName + '.metadata.json',
              vscode.ViewColumn.One,
              {
                enableScripts: true,
              }
            );
            currentPanel.webview.html = getDocumentMetaData(result?.rows);

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
            `Document metadata retrieval failed for '${node.documentName}'`
          );
          logger.debug(err);
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
          vscode.window.showErrorMessage("Document Id is required.");
          return;
        }
        try {
          const documentInfo: IDocumentData = {
            bucket: node.bucketName,
            scope: node.scopeName,
            collection: node.collectionName,
            name: documentName
          };
          const result = await getDocument(connection, documentInfo);
          const uri = vscode.Uri.parse(
            `couchbase:/${node.bucketName}/${node.scopeName}/Collections/${node.collectionName}/${documentName}.json`
          );
          if (result) {
            uriToCasMap.set(uri.toString(), result.cas.toString());
          }
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
              `The document with document Id ${documentName} does not exist`,
              { modal: true }
            );
            logger.info(`The document with document Id ${documentName} does not exist`);
          } else {
            logger.error(
              `An error occured while retrieving document with document Id ${documentName}`
            );
            logger.debug(err);
          }
        }
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-couchbase.refreshIndexes",
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
        try {
          if (currentPanel && currentPanel.viewType === 'Workbench') {
            currentPanel.webview.html = getQueryWorkbench();
            currentPanel.reveal(vscode.ViewColumn.One);
          } else {
            currentPanel = vscode.window.createWebviewPanel(
              'Workbench',
              'New Workbench',
              vscode.ViewColumn.One,
              {
                enableScripts: true,
              }
            );
            currentPanel.webview.html = getQueryWorkbench();

            currentPanel.onDidDispose(
              () => {
                currentPanel = undefined;
              },
              undefined,
              context.subscriptions
            );
          }
        } catch (err) {
          logger.error("Failed to open Query Workbench");
          logger.debug(err);
        }
      }
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand("vscode-couchbase.openSampleProjects", async () => {
      try {
        const panel = vscode.window.createWebviewPanel(
          "sampleProjects",
          "Sample Projects",
          vscode.ViewColumn.One,
          {
            enableScripts: true,
          }
        );
        panel.webview.html = getSampleProjects();
        panel.webview.onDidReceiveMessage(
          async (message) => {
            if (!message || !message.repo) {
              return;
            }

            const projectName = await vscode.window.showInputBox({
              prompt: "Project Name",
              placeHolder: "Project-Name",
              ignoreFocusOut: true,
              value: "",
            });
            if (!projectName) {
              vscode.window.showErrorMessage("Project name is required.");
              return;
            }

            const fileUris = await vscode.window.showOpenDialog({
              openLabel: "Select location",
              canSelectMany: false,
              canSelectFiles: false,
              canSelectFolders: true,
            });
            if (!fileUris || !fileUris[0]) {
              vscode.window.showErrorMessage("Project location is required.");
              return;
            }

            const projectUri = vscode.Uri.joinPath(fileUris[0], projectName);
            try {
              // test if the project location already exists, if so, show error message
              // fs.stat will throw an error if the file does not exist
              await vscode.workspace.fs.stat(projectUri);
              vscode.window.showErrorMessage("Selected project location already has a project with same name, please choose a different location.", { modal: true });
              return;
            } catch {
              // do nothing, project location does not exist
            }

            const repoUrl = `couchbase-examples/${message.repo}`;
            await gitly(repoUrl, projectUri.path, { throw: true });

            vscode.window.showInformationMessage(``);
            let answer = await vscode.window.showInformationMessage(
              `Example project created at: ${projectUri.path}.`,
              ...["Open", "Add to Workspace"]
            );
            switch (answer) {
              case "Open":
                await vscode.commands.executeCommand(
                  "vscode.openFolder",
                  projectUri
                );
                break;
              case "Add to Workspace":
                vscode.workspace.updateWorkspaceFolders(
                  vscode.workspace.workspaceFolders
                    ? vscode.workspace.workspaceFolders.length
                    : 0,
                  null,
                  { uri: projectUri }
                );
                break;
            }
            panel.dispose();
          },
          undefined,
          context.subscriptions
        );
      } catch (err) {
        logger.error("Failed to open sample projects");
        logger.debug(err);
      }
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
