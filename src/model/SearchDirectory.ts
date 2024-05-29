import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { IConnection } from "../types/IConnection";
import { INode } from "../types/INode";
import SearchIndexNode from "./SearchIndexNode";
import { logger } from "../logger/logger";
import InformationNode from "./InformationNode";
import { CouchbaseRestAPI } from "../util/apis/CouchbaseRestAPI";
import { getActiveConnection } from "../util/connections";
import * as path from "path";

export class SearchDirectory implements INode {
    constructor(public readonly parentNode: INode,
        public readonly itemName: string,
        public readonly bucketName: string,
        public readonly scopeName: string) {
    }

    public getTreeItem(): TreeItem {
        return {
            label: `${this.itemName}`,
            collapsibleState: TreeItemCollapsibleState.Collapsed,
            contextValue: "searchDirectory",
            iconPath: {
                light: path.join(
                  __filename,
                  "..",
                  "..",
                  "images/light",
                  "search-icon.svg"
                ),
                dark: path.join(
                  __filename,
                  "..",
                  "..",
                  "images/dark",
                  "search-icon.svg"
                ),
              }
        };
    }

    public async getChildren(): Promise<INode[]> {
        try {
            // get all search indexes
            const connection =  getActiveConnection();
            if (!connection){

                return []
            }
            const searchIndexesManager = connection?.cluster?.searchIndexes();
            const ftsIndexes = await searchIndexesManager?.getAllIndexes();
            const bucketIndexes = ftsIndexes?.filter(index => index.sourceName === this.bucketName);
            if (bucketIndexes === undefined) {
                return [];
            }
            const searchIndexChildren: INode[] = bucketIndexes.map((searchIndex) =>
                new SearchIndexNode(
                    searchIndex.name,
                    this.bucketName,
                    this.scopeName,
                    searchIndex.name
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
