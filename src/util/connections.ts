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
import { Constants } from "./constants";
import { Global, Memory } from "./util";
import { IConnection } from "../types/IConnection";
import { AuthenticationFailureError, connect } from "couchbase";
import { getClusterConnectingFormView } from "../webViews/connectionScreen.webview";
import ClusterConnectionTreeProvider from "../tree/ClusterConnectionTreeProvider";
import { logger } from "../logger/logger";
import { getServices } from "./OverviewClusterUtils/ClusterOverviewGeneralTab";
import { CouchbaseRestAPI } from "./apis/CouchbaseRestAPI";
import { hasQueryService, hasSearchService } from "./common";
import { SecretService } from "./secretService";
import ConnectionEvents from "./events/connectionEvents";
import { SdkDoctorRunner } from "../tools/SDKDocterRunner";

export function getConnectionId(connection: IConnection) {
  const { url, username } = connection;
  return `${username}@${url}`;
}

export function getConnections() {
  return Global.state.get<{ [key: string]: IConnection }>(Constants.connectionKeys);
}

export function getActiveConnection(): IConnection | undefined {
  return Memory.state.get<IConnection>(Constants.ACTIVE_CONNECTION);
}

export function setActiveConnection(connection?: IConnection) {
  Memory.state.update(Constants.ACTIVE_CONNECTION, connection);
}

export function getPreviousConnection(): IConnection | undefined {
  return Memory.state.get<IConnection>("previousConnection");
}

export function setPreviousConnection(connection: IConnection) {
  Memory.state.update("previousConnection", connection);
}

async function saveConnection(connection: IConnection): Promise<string> {
  const { url, username, connectionIdentifier, isSecure } = connection;
  let connections = getConnections();
  if (!connections) {
    connections = {};
  }
  const id = getConnectionId(connection);
  connections[id] = {
    url,
    username,
    connectionIdentifier,
    isSecure
  };
  const secretService = SecretService.getInstance();
  const password =
    connection.password ||
    (await secretService.get(`${Constants.extensionID}-${id}`));
  if (password) {
    secretService.store(`${Constants.extensionID}-${id}`, password);
  }
  await Global.state.update(Constants.connectionKeys, connections);
  return id;
}

export function getConnection(id: string): IConnection | undefined {
  let connections = getConnections();
  if (connections) {
    return connections[id];
  }
}

export async function addConnection(clusterConnectionTreeProvider: ClusterConnectionTreeProvider, message?: any) {
  const currentPanel = vscode.window.createWebviewPanel(
    "connectionProvider",
    "Connect to Couchbase",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      enableForms: true,
      retainContextWhenHidden: true,
    }
  );
  currentPanel.iconPath = vscode.Uri.file(path.join(__filename, "..", "..", "images", "cb-logo-icon.svg"));

  currentPanel.webview.onDidReceiveMessage(async (message: any) => {
    switch (message.command) {
      case 'submit':
        const url = message.isSecure ? (Constants.prefixSecureURL + message.url) : (Constants.prefixURL + message.url);
        const connection: IConnection = { url, username: message.username, password: message.password, connectionIdentifier: message.connectionIdentifier, isSecure: message.isSecure };
        const connections = getConnections();
        const connectionId = getConnectionId(connection);
        if (connections && connections[connectionId]) {
          const answer = await vscode.window.showInformationMessage(`A connection named '${connections[connectionId].connectionIdentifier}' already contains the same user and server.\n To proceed, either delete the existing connection & try again or continue to the existing connection`, { modal: true }, "Connect to Existing");
          // If the user chooses the "Connect to Existing" option, use the existing connection, refresh the UI and close the current panel.
          if (answer === "Connect to Existing") {
            await useConnection(connections[connectionId]);
            clusterConnectionTreeProvider.refresh();
            currentPanel.dispose();
            break;
          } else {
            currentPanel.dispose();
            addConnection(clusterConnectionTreeProvider, message);
            break;
          }
        }

        await saveConnection({
          ...connection,
          cluster: undefined,
        });

        if (connectionId) {
          const connections = getConnections();
          if (connections) {
            const connectionStatus = await useConnection(connections[connectionId]);
            // If the connection fails we should delete the saved cluster and show the addConnection() window again
            if (connectionStatus === false) {
              delete connections[connectionId];
              Global.state.update(Constants.connectionKeys, connections);
              const secretService = SecretService.getInstance();
              secretService.delete(`${Constants.extensionID}-${connectionId}`);
              currentPanel.dispose();
              await addConnection(clusterConnectionTreeProvider, message);
              break;
            }
          }
        }
        clusterConnectionTreeProvider.refresh();
        currentPanel.dispose();
        // Do a full cache for the first time user creates connection
        clusterConnectionTreeProvider.cacheService.fullCache(true);
        logger.info(`Successfully saved a new connection with the name ${connection.connectionIdentifier}`);
        break;

      case 'cancel':
        currentPanel.dispose();
        break;

      case 'testConnection':
        const { connectionUrl, username, password, bucketName, isSecure } = message;
        if(bucketName === "") {
        try {
          await connect(connectionUrl, { username: username, password: password, configProfile: 'wanDevelopment' });
          currentPanel.webview.postMessage({
            command: 'testConnectionResult',
            result: 'Connection was successfull!'
        });
        }
        catch (err) {
          currentPanel.webview.postMessage({
            command: 'testConnectionResult',
            result: '[ERRO]: Connection Failed ' + err
        });
        }
        return;
      }
        const results: string[] = [];

        await SdkDoctorRunner.run(
            connectionUrl,
            isSecure,
            bucketName,
            username,
            password,
            (line) => {
                results.push(line);
            }
        );

        currentPanel.webview.postMessage({
            command: 'testConnectionResult',
            result: results.join('\n')
        });
        break;

      default:
        console.error('Unrecognized command');
    }
  });
  currentPanel.webview.html = getClusterConnectingFormView(message);
}

async function handleConnectionError(err: any) {
  let answer;
  if (err instanceof AuthenticationFailureError) {
    answer = await vscode.window.showErrorMessage(`
    Authentication Failed: Please check your credentials and try again \n
    or inform a Bucket on Troubleshooting to inspect your connection \n
    or check out this helpful troubleshooting link`, { modal: true }, "Troubleshoot Link");
  }
  else {
    answer = await vscode.window.showErrorMessage(`Could not establish a connection \n ${err} \n Inform a Bucket on Troubleshooting to inspect your connection \n or check out this helpful troubleshooting link`, { modal: true }, "Troubleshoot Link");
  }

  if (answer === "Troubleshoot Link") {
    vscode.commands.executeCommand('simpleBrowser.show', `https://docs.couchbase.com/go-sdk/current/howtos/troubleshooting-cloud-connections.html`);
  }
}

export async function useConnection(connection: IConnection): Promise<boolean> {
  const id = getConnectionId(connection);
  let status = false;
  const secretService = SecretService.getInstance();
  const password = await secretService.get(`${Constants.extensionID}-${id}`);
  if (!password) {
    return status;
  }
  const options = {
    location: vscode.ProgressLocation.Notification,
    cancellable: false
  };
  await vscode.window.withProgress(
    options, async (progress) => {
      progress.report({ message: "Trying to connect..." });
      try {
        connection.cluster = await connect(connection.url, { username: connection.username, password: password, configProfile: 'wanDevelopment' });
        setActiveConnection(connection);
        // Set Services
        const couchbaseRestAPI = new CouchbaseRestAPI(connection);
        const serviceOverview = await couchbaseRestAPI.getOverview();
        connection.services = getServices(serviceOverview!);
        // Set the isKVCluster context
        vscode.commands.executeCommand('setContext', 'isKVCluster', !hasQueryService(connection.services));
        vscode.commands.executeCommand('setContext', 'isSearchEnabled', hasSearchService(connection.services));
        status = true;
        ConnectionEvents.emitConnectionChanged(connection);
        vscode.window.showInformationMessage("Connection established successfully!");
        logger.info(`Connection established successfully with ${connection.connectionIdentifier}`);
      }
      catch (err) {
        handleConnectionError(err);
      }
    });
  return status;
}

export async function removeConnection(connection: IConnection) {
  if (!connection) {
    return;
  }
  const connections = getConnections();
  if (!connections) {
    return;
  }

  const connectionId = getConnectionId(connection);
  let answer = await vscode.window.showInformationMessage(`Are you sure you want to remove cluser connection [${connectionId}]?`, ...["Yes", "No"]);
  if (answer !== "Yes") {
    return;
  }

  delete connections[connectionId];
  Global.state.update(Constants.connectionKeys, connections);
  const secretService = SecretService.getInstance();
  await secretService.delete(`${Constants.extensionID}-${connectionId}`);

  ConnectionEvents.emitConnectionRemoved();
  const activeConnection = getActiveConnection();
  if (connection.connectionIdentifier === activeConnection?.connectionIdentifier) {
    setActiveConnection();
  }
}