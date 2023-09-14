import * as vscode from "vscode";
import * as path from "path";
import { IConnection } from "../types/IConnection";
import { INode } from "../types/INode";
import { logger } from "../logger/logger";
import SchemaNode from "./SchemaNode";



export default class SchemaPatternDirectory implements INode {
    constructor(
      public readonly parentNode: INode,
      public readonly connection: IConnection,
      public readonly scopeName: string,
      public readonly bucketName: string,
      public readonly collectionName: string,
      public readonly schemaName: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly schemaRow: any,
      public limit: number = 10
    ) {}
    public async getTreeItem(): Promise<vscode.TreeItem> {
        return {
            label: `${this.schemaName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "schemaDirectory",
        };
    }

    public async getChildren(): Promise<INode[]> {
        try{
            const schemaList:INode[] = [];
            Object.entries(this.schemaRow.properties).map(property => {
                let key = property[0];
                let value = property[1];
                const treeObj = this.traverseObjectTree(key, value);
                schemaList.push(treeObj);
            });
            return schemaList;
        } catch(err){
            logger.error("Failed to load schemas: " + err);
            return [];
        }
        return [];
    }
    private traverseObjectTree = (key: string, property: any):INode => {
        if(property.type === "array"){
            console.log(property);
            return new SchemaPatternDirectory(this, this.connection, this.scopeName,this.bucketName, this.collectionName, `${key}: ${property.type}`, vscode.TreeItemCollapsibleState.Collapsed,property.items);
        } else {
            return new SchemaNode(this, this.connection, this.scopeName, this.bucketName, this.collectionName,  `${key}: ${property.type}`, vscode.TreeItemCollapsibleState.None, property);
        }
        
    };
}