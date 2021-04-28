import * as vscode from 'vscode';
import * as path from 'path';
import * as keytar from 'keytar';

import { Memory } from '../util/util';

import { IConnection } from "./IConnection";
import { INode } from "./INode";
import { Constants } from '../util/constants';
import ClusterConnectionTreeProvider from '../tree/ClusterConnectionTreeProvider';
import { BucketNode } from './BucketNode';
import { getDefaultPools } from '../util/requests';

export class ClusterConnectionNode implements INode {
    constructor(private readonly id:string, private readonly connection: IConnection) {
    }
    public connectToNode() {
        const connection = {...this.connection};
        Memory.state.update('activeConnection', connection);
        return this.id;
    }

    // Cluster Connection Top Level
    public getTreeItem(): vscode.TreeItem {
        const id = `${this.connection.username}@${this.connection.url}`;
        const activeConnection = Memory.state.get<IConnection>('activeConnection');
        return {
            label: id,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "connection",
            iconPath: path.join(__filename, "..", "..", "..", "media", this.equalsConnection(activeConnection) ? "db-active.png": 'db-inactive.png'),
        };
    }
    
    private equalsConnection(activeConnection:IConnection|undefined):Boolean{
        if(!activeConnection){
            return false;
        }
        if(this.connection.url !== activeConnection.url){
            return false;
        }
        if(this.connection.port !== activeConnection.port){
            return false;
        }
        if(this.connection.username !== activeConnection.username){
            return false;
        }
        return true;
    }

    // Run api request here and get list of buckets
    public async getChildren(): Promise<INode[]> {

        let buckets_test = [];

        const buckets = await getDefaultPools(this.connection);
    
        buckets_test.push(new BucketNode(this.connection, 'bucket1', vscode.TreeItemCollapsibleState.None));
        buckets_test.push(new BucketNode(this.connection, 'bucket2', vscode.TreeItemCollapsibleState.None));
        
        return buckets_test;
    }

    public async deleteConnection(context: vscode.ExtensionContext, treeProvider: ClusterConnectionTreeProvider) {

        const connections = context.globalState.get<{ [key: string]: IConnection }>(Constants.connectionKeys);
        if(connections){
            delete connections[this.id];
        }
        await context.globalState.update(Constants.connectionKeys, connections);

        await keytar.deletePassword(Constants.extensionID, this.id);

        treeProvider.refresh();
    }
}