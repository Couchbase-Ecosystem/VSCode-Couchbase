import * as vscode from 'vscode';
import * as path from 'path';
import * as keytar from 'keytar';

import { Memory } from '../util/util';

import { IConnection } from "./IConnection";
import { INode } from "./INode";
import { Constants } from '../util/constants';
import ClusterConnectionTreeProvider from '../tree/ClusterConnectionTreeProvider';
import { BucketNode } from './BucketNode';
import { ENDPOINTS } from '../util/endpoints';

import get from "axios";
import { AxiosRequestConfig } from "axios";


export class ClusterConnectionNode implements INode {
    constructor(private readonly id:string, private readonly connection: IConnection) {
    }
    public connectToNode() {
        const connection = {...this.connection};
        Memory.state.update('activeConnection', connection);
        return this.id;
    }

    public getTreeItem(): vscode.TreeItem {
        const id = `Cluster:${this.connection.username}@${this.connection.url}`;
        const activeConnection = Memory.state.get<IConnection>('activeConnection');

        return {
            label: this.equalsConnection(activeConnection) ? `Active:${id}`: id,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "connection",
            // iconPath: path.join(__filename, "..", "media", this.equalsConnection(activeConnection) ? "green.png": 'db-inactive.png'),
        };
    }
    
    private equalsConnection(activeConnection:IConnection|undefined):Boolean{
        if(!activeConnection){
            return false;
        }
        if(this.connection.url !== activeConnection.url){
            return false;
        }
        if(this.connection.username !== activeConnection.username){
            return false;
        }
        return true;
    }

    public async getChildren(): Promise<INode[]> {

        try {
            const options: AxiosRequestConfig = {
              auth: {
                username: this.connection.username,
                password: this.connection.password ? this.connection.password : "",
              },
            };

            const bucketsResponse = await get(
              `${this.connection.url}${ENDPOINTS.GET_POOLS}`,
              options
            );
      
            let bucketList: BucketNode[] = [];
            bucketsResponse.data.forEach((bucket: any) => {
              const bucketTreeItem = new BucketNode(
                this.connection,
                bucket.name,
                vscode.TreeItemCollapsibleState.None
              );
              bucketList.push(bucketTreeItem);
            });
      
            return bucketList;
          } catch (err) {
            console.log(err);
            throw new Error(err);
          }
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