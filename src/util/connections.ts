import * as vscode from 'vscode';
import * as keytar from 'keytar';
import { Constants } from './constants';
import { Global, Memory } from './util';
import { IConnection } from '../model/IConnection';
import { ClusterConnectionNode } from '../model/ClusterConnectionNode';



export function getConnectionId(connection: IConnection) {
    const {url, username, connectionIdentifier} = connection;
    return `${username}@${url}`;
}

async function saveConnection(connection: IConnection) {
    const {url, username, connectionIdentifier} = connection;
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
        connectionIdentifier
    };
    const password = connection.password || await keytar.getPassword(Constants.extensionID, id);
    if (password) {
        await keytar.setPassword(Constants.extensionID, id, password);
    }
    await Global.state.update(Constants.connectionKeys, connections);
    return { connections, id };
}

export async function getConnection(id: string):Promise<IConnection|undefined>{
    let connections = await Global.state.get<{[key:string]:IConnection}>(Constants.connectionKeys);
    if(connections){
        return connections[id];
    }
}

export async function addConnection() {
    const url = await vscode.window.showInputBox({ prompt: "Enter Cluter Connection URL", placeHolder: "URL", ignoreFocusOut: true , value: "http://127.0.0.1:8091"});
    if (!url) {
        return;
    }
    const username = await vscode.window.showInputBox({ prompt: "Enter Username", placeHolder: "Username", ignoreFocusOut: true, value: "Administrator" });
    if (!username) {
        return;
    }

    const password = await vscode.window.showInputBox({ prompt: "Enter Password", placeHolder: "Password", ignoreFocusOut: true, value: "password" });
    if (!password) {
        return;
    }

    const connectionIdentifier = await vscode.window.showInputBox({ prompt: "Enter Connection Identifier (Optional)", placeHolder: "Connection Identifier", ignoreFocusOut: true, value: '' });
    if (!connectionIdentifier) {
        return;
    }

    var { connections, id } = await saveConnection({
        url,
        username,
        password,
        connectionIdentifier
    });
    Memory.state.update('activeConnection', {
        password,
        ...connections[id]
    });
}

export async function useConnection(connection:ClusterConnectionNode){
    const id = connection.connectToNode();
    const activeConnection = Memory.state.get<{[key: string]:any}>('activeConnection');
    if(!activeConnection){
        return;
    }
    if(!activeConnection.password){
        activeConnection.password = await keytar.getPassword(Constants.extensionID, id) || '';
    }
    if(!activeConnection.password){
        activeConnection.password = await vscode.window.showInputBox({
            placeHolder: 'Password'
        });
    }
    return;
}