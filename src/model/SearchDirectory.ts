import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { IConnection } from "../types/IConnection";
import { INode } from "../types/INode";
import SearchIndexNode from "./SearchIndexNode";
import { logger } from "../logger/logger";
import InformationNode from "./InformationNode";


export class SearchDirectory implements INode {
    constructor(public readonly parentNode: INode,
        public readonly connection: IConnection,
        public readonly itemName: string,
        public readonly bucketName: string,
        public readonly scopeName: string) {
    }

    public getTreeItem(): TreeItem {
        return {
            label: `${this.itemName}`,
            collapsibleState: TreeItemCollapsibleState.Collapsed,
            contextValue: "searchDirectory",
        };
    }

    public async getChildren(): Promise<INode[]> {
        try {
            // get all search indexes
            const scope = this.connection.cluster?.bucket(this.bucketName).scope(this.scopeName);
            const searchIndexes = await scope?.searchIndexes().getAllIndexes();
            if(searchIndexes === undefined){
                return [];
            }
            const searchIndexChildren: INode[] = searchIndexes.map((searchIndex)=>
                new SearchIndexNode(
                    searchIndex.name,
                )
               
                
            ) || [];
            if (searchIndexChildren.length === 0) {
                searchIndexChildren.push(new InformationNode("No search indexes found"));
            }
            return searchIndexChildren;
        }
        catch (error) {
            logger.error(`Error getting search indexes: ${error}`);
            return [];
        }
    }
}

