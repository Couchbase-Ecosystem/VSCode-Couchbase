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
import * as keytar from "keytar";
import { Constants } from "./constants";
import { Global, Memory } from "./util";
import { IConnection } from "../model/IConnection";
import { Cluster } from "couchbase";

export function getConnectionId(connection: IConnection) {
  const { url, username, connectionIdentifier } = connection;
  return `${username}@${url}`;
}

export function getConnections() {
  return Global.state.get<{ [key: string]: IConnection }>(Constants.connectionKeys);
}

export function getActiveConnection(): IConnection | undefined {
  return Memory.state.get<IConnection>("activeConnection");
}

export function setActiveConnection(connection?: IConnection) {
  Memory.state.update("activeConnection", connection);
}

export function getPreviousConnection(): IConnection | undefined {
  return Memory.state.get<IConnection>("previousConnection");
}

export function setPreviousConnection(connection: IConnection) {
  Memory.state.update("previousConnection", connection);
}

async function saveConnection(connection: IConnection): Promise<string> {
  const { url, username, connectionIdentifier } = connection;
  let connections = getConnections();
  if (!connections) {
    connections = {};
  }
  const id = getConnectionId(connection);
  connections[id] = {
    url,
    username,
    connectionIdentifier
  };
  const password =
    connection.password ||
    (await keytar.getPassword(Constants.extensionID, id));
  if (password) {
    await keytar.setPassword(Constants.extensionID, id, password);
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

export async function addConnection() {
  const url = await vscode.window.showInputBox({
    prompt: "Enter Cluter Connection URL",
    placeHolder: "URL",
    ignoreFocusOut: true,
    value: "http://127.0.0.1:8091",
  });
  if (!url) {
    vscode.window.showErrorMessage('Cluster URL is required.');
    return;
  }
  const username = await vscode.window.showInputBox({
    prompt: "Enter Username",
    placeHolder: "Username",
    ignoreFocusOut: true,
    value: "Administrator",
  });
  if (!username) {
    vscode.window.showErrorMessage('Username is required.');
    return;
  }

  const password = await vscode.window.showInputBox({
    prompt: "Enter Password",
    placeHolder: "Password",
    ignoreFocusOut: true,
    value: "password",
  });
  if (!password) {
    vscode.window.showErrorMessage('Password is required.');
    return;
  }

  let connectionIdentifier = await vscode.window.showInputBox({
    prompt: "Enter Connection Identifier (optional)",
    placeHolder: "Connection Identifier",
    ignoreFocusOut: true,
    value: "",
  });
  if (!connectionIdentifier) {
    connectionIdentifier = "";
  }

  const connectionId = await saveConnection({
    url,
    username,
    password,
    connectionIdentifier,
    cluster: undefined
  });
  if (connectionId) {
    const connections = getConnections();
    if (connections) {
      await useConnection(connections[connectionId]);
    }
  }
}

export async function useConnection(connection: IConnection) {
  const id = getConnectionId(connection);
  const password = await keytar.getPassword(Constants.extensionID, id);
  if (!password) {
    return;
  }
  connection.cluster = await Cluster.connect(connection.url, { username: connection.username, password: password });
  setActiveConnection(connection);
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
  await keytar.deletePassword(Constants.extensionID, connectionId);

  const activeConnection = getActiveConnection();
  if (connection.connectionIdentifier === activeConnection?.connectionIdentifier) {
    setActiveConnection();
  }
}