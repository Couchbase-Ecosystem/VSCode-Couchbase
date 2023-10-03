import { IConnection } from "../types/IConnection";
import { INode } from "../types/INode";
import * as vscode from 'vscode';
import { QueryOptions, QueryProfileMode } from "couchbase";
import SchemaNode from "./SchemaNode";
import { logger } from "../logger/logger";
import { getActiveConnection } from "../util/connections";

export class SchemaDirectory implements INode {
    constructor(public readonly parentNode: INode,
        public readonly connection: IConnection,
        public readonly itemName: string,
        public readonly bucketName: string,
        public readonly scopeName: string,
        public readonly collectionName: string) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: `${this.itemName}`,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "schemaDirectory",
        };
    }

    public async getChildren(): Promise<INode[]> {
        try {
            // get all schemas
            let query = "INFER `" + this.bucketName + "`.`" + this.scopeName + "`.`" + this.collectionName + "` WITH {\"sample_size\": 2000}";
            const connection = getActiveConnection();
            const result = await connection?.cluster?.query(query);
            let schemaChildren: INode[] = [];
            let patternCnt: number = result?.rows[0].length || 0;
            for (let i = 0; i < patternCnt; i++) {
                let row = result?.rows[0][i];
                let childrenNode = this.treeTraversal(row.properties);
                let patternDirectory = new SchemaNode(
                    `Pattern #${i + 1}`,
                    childrenNode.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                    childrenNode
                );
                schemaChildren.push(patternDirectory);
            }
            return schemaChildren;
        } catch (err) {
            logger.error("Error while getting schema: " + err);
            return [];
        }
    }

    private treeTraversal(treeNode: any): INode[] {
        if (!treeNode) {
            return [];
        }
        let currentNodes: INode[] = [];
        Object.entries(treeNode).map(property => {
            let propertyValue: any = property[1];
            let type = propertyValue.type;
            if (type === 'object') {
                let children = this.treeTraversal(propertyValue.properties);
                currentNodes.push(new SchemaNode(`${property[0]}: ${type}`, vscode.TreeItemCollapsibleState.Collapsed, children));
            } else if (type === 'array') {
                try {
                    let items = propertyValue.items;
                    let itemType = items.type;
                    if (itemType === 'object') {
                        let children = this.treeTraversal(items.properties);
                        currentNodes.push(new SchemaNode(`${property[0]}: array of objects`, vscode.TreeItemCollapsibleState.Collapsed, children));
                    } else {
                        currentNodes.push(new SchemaNode(`${property[0]}: array of ${itemType}s`, vscode.TreeItemCollapsibleState.None));
                    }
                } catch (error) {
                    logger.error(`Error processing array type for ${property[0]}: ${error}`);
                }
            } else {
                // Leaf node condition
                try {
                    let currentType: string = type.toString();
                    currentType = currentType.replace(',', " | ");
                    currentNodes.push(new SchemaNode(`${property[0]}: ${currentType}`, vscode.TreeItemCollapsibleState.None));
                } catch (e) {
                    logger.error("Type can't be stringified: " + e);
                }
            }
        });
        return currentNodes;
    }
}

