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
import { ClusterConnectionNode } from "../model/ClusterConnectionNode";
import { Cluster } from "couchbase";

export function getConnectionId(connection: IConnection) {
  const { url, username, connectionIdentifier } = connection;
  return `${username}@${url}`;
}

async function saveConnection(connection: IConnection) {
  const { url, username, connectionIdentifier } = connection;
  let connections = Global.state.get<{
    [key: string]: IConnection;
  }>(Constants.connectionKeys);
  if (!connections) {
    connections = {};
  }
  const id = getConnectionId(connection);
  connections[id] = {
    url,
    username,
    connectionIdentifier,
    queryUrl: `${url.substr(0, url.lastIndexOf(':'))}:8093/query/service`,
    cluster: undefined
  };
  const password =
    connection.password ||
    (await keytar.getPassword(Constants.extensionID, id));
  if (password) {
    await keytar.setPassword(Constants.extensionID, id, password);
  }
  await Global.state.update(Constants.connectionKeys, connections);
  return { connections, id };
}

export async function getConnection(
  id: string
): Promise<IConnection | undefined> {
  let connections = await Global.state.get<{ [key: string]: IConnection }>(
    Constants.connectionKeys
  );
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

  var { connections, id } = await saveConnection({
    url,
    username,
    password,
    connectionIdentifier,
    queryUrl: `${url.substr(0, url.lastIndexOf(':'))}:8093/query/service`,
    cluster: undefined
  });
  Memory.state.update("activeConnection", {
    password,
    ...connections[id],
  });
}

export async function useConnection(connection: ClusterConnectionNode) {
  const id = connection.connectToNode();
  const activeConnection =
    Memory.state.get<{ [key: string]: any }>("activeConnection");
  if (!activeConnection) {
    return;
  }
  if (!activeConnection.password) {
    activeConnection.password =
      (await keytar.getPassword(Constants.extensionID, id)) || "";
  }
  if (!activeConnection.password) {
    activeConnection.password = await vscode.window.showInputBox({
      placeHolder: "Password",
    });
  }
  return;
}
