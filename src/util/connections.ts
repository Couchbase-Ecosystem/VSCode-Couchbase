import * as vscode from 'vscode';
import * as keytar from 'keytar';
import { Constants } from './constants';
import { Global, Memory } from './util';
import { IConnection } from '../model/IConnection';



export function getConnectionId(connection: IConnection) {
    const {url,port, username,} = connection;
    return `${username}@${url}:${port}`;
}

async function saveConnection(connection: IConnection) {
    const {url, port, username} = connection;
    let connections = Global.state.get<{
        [key: string]: IConnection;
    }>(Constants.connectionKeys);
    if (!connections) {
        connections = {};
    }
    const id = getConnectionId(connection);
    connections[id] = {
        url,
        port,
        username
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
    const url = await vscode.window.showInputBox({ prompt: "Enter Cluter Connection URL", placeHolder: "URL", ignoreFocusOut: true });
    if (!url) {
        return;
    }
    const port = await vscode.window.showInputBox({ prompt: "Enter Port Number", placeHolder: "Port Number", ignoreFocusOut: true });
    if (!port) {
        return;
    }
    const username = await vscode.window.showInputBox({ prompt: "Enter Username", placeHolder: "Username", ignoreFocusOut: true });
    if (!username) {
        return;
    }

    const password = await vscode.window.showInputBox({ prompt: "Enter Password", placeHolder: "Password", ignoreFocusOut: true });
    if (!password) {
        return;
    }

    var { connections, id } = await saveConnection({
        url,
        username,
        port,
        password
    });
    Memory.state.update('activeConnection', {
        password,
        ...connections[id]
    });
}