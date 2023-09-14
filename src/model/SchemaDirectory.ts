import { IConnection } from "../types/IConnection";
import { INode } from "../types/INode";
import * as vscode from 'vscode';
import * as path from 'path';
import { QueryOptions, QueryProfileMode } from "couchbase";
import SchemaPatternDirectory from "./SchemaPatternDirectory";

export class SchemaDirectory implements INode {
    constructor(public readonly parentNode: INode,
        public readonly connection: IConnection,
        public readonly itemName: string,
        public readonly bucketName: string,
        public readonly scopeName: string,
        public readonly collectionName: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: `${this.itemName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "schemaDirectory",
        };
    }

    public async getChildren(): Promise<INode[]> {
        // get all schemas
        let query = "INFER `" + this.bucketName + "`.`" + this.scopeName + "`.`" + this.collectionName + "` WITH {\"sample_size\": 2000}";
        const queryOptions: QueryOptions = {
            profile: QueryProfileMode.Timings,
            metrics: false,
        };
        const result = await this.connection.cluster?.query(query, queryOptions);
        console.log(result);
        let schemaChildren:INode[] = [];
        for(let row of result?.rows[0] || []){
            schemaChildren.push(new SchemaPatternDirectory(this,this.connection,this.scopeName, this.bucketName, this.collectionName, "Pattern",  vscode.TreeItemCollapsibleState.None, row));
        }
        return schemaChildren;
    }
}

