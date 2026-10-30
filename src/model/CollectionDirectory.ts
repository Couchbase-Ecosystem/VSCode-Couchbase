import * as vscode from "vscode";
import { INode } from "../types/INode";
import { logger } from "../logger/logger";
import { CouchbaseRestAPI } from "../util/apis/CouchbaseRestAPI";
import { CacheService } from "../util/cacheService/cacheService";
import { getActiveConnection } from "../util/connections";
import { Memory } from "../util/util";
import { hasQueryService } from "../util/common";
import { COLLECTION_PAGE_SIZE, getFavoriteCollections, getVisibleCollections } from "../util/collectionListing";
import { ParsingFailureError, PlanningFailureError } from "couchbase";
import CollectionNode from "./CollectionNode";
import InformationNode from "./InformationNode";
import { PagerNode } from "./PagerNode";

export class CollectionDirectory implements INode {
    // Collections added from the search box; cleared when the tree is collapsed
    private searchedCollections: string[] = [];

    constructor(
        public readonly parentNode: INode,
        public readonly scopeName: string,
        public readonly bucketName: string,
        public readonly collections: any[],
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public cacheService: CacheService,
        public limit: number = COLLECTION_PAGE_SIZE
    ) {}

    public getTreeItem(): vscode.TreeItem {
        return {
            label: `Collections`,
            collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
            contextValue: "collectionDirectory",
        };
    }

    public addSearchedCollection(collectionName: string): void {
        this.searchedCollections = [
            collectionName,
            ...this.searchedCollections.filter((name) => name !== collectionName),
        ];
    }

    public onCollapse(): void {
        this.searchedCollections = [];
        this.limit = COLLECTION_PAGE_SIZE;
    }

    public async getChildren(): Promise<INode[]> {
        const connection = getActiveConnection();
        if (!connection) {
          return [];
        }
        const collectionList: INode[] = [];
        const favorites = getFavoriteCollections(connection.connectionIdentifier, this.bucketName, this.scopeName);
        const { searched, paged, hasMore } = getVisibleCollections(
            this.collections.map((collection) => collection.name),
            favorites,
            this.searchedCollections,
            this.limit
        );
        if (searched.length === 0 && paged.length === 0) {
          return [new InformationNode("No Collections found")];
        }

        const couchbaseRestAPI = new CouchbaseRestAPI(connection);
        const KVCollectionCount: Map<string, number> = await couchbaseRestAPI.getKVDocumentCount(this.bucketName, this.scopeName);

        const visibleCollections = [
            ...searched.map((name) => ({ name, isSearchResult: true })),
            ...paged.map((name) => ({ name, isSearchResult: false })),
        ];
        for (const collection of visibleCollections) {
          try {
            const queryTypeFilter = Memory.state.get<string>(
              `queryTypeFilterDocuments-${connection.connectionIdentifier}-${this.bucketName}-${this.scopeName}-${collection.name}`
            ) ?? "";
    
            const filterDocumentsType =  Memory.state.get<string>(
              `filterDocumentsType-${connection.connectionIdentifier}-${this.bucketName}-${this.scopeName}-${collection.name}`
            ) ?? "";
    
            let rowCount = 0;
            try {
              if (!hasQueryService(connection?.services) || filterDocumentsType !== "query") {
                rowCount = KVCollectionCount.get(`kv_collection_item_count-${this.bucketName}-${this.scopeName}-${collection.name}`) ?? 0;
    
                if(filterDocumentsType === "kv") {
                  rowCount = -1;
                }
              }
              else {
                const queryResult = await connection?.cluster?.query(
                  `select count(1) as count from \`${this.bucketName}\`.\`${this.scopeName
                  }\`.\`${collection.name}\` ${queryTypeFilter.length > 0 ? "WHERE " + queryTypeFilter : ""
                  };`
                );
                rowCount = queryResult?.rows[0].count;
              }
            } catch (err: any) {
              if (err instanceof PlanningFailureError) {
                vscode.window.showErrorMessage(
                  "Unable to find primary index for document and filter seems to be applied, showing count as 0"
                );
              } else if (err instanceof ParsingFailureError) {
                logger.error(`In Scope Node: ${this.scopeName}: Parsing Failed: Incorrect filter definition`);
              }
            }
    
            const collectionTreeItem = new CollectionNode(
              this,
              this.scopeName,
              rowCount,
              this.bucketName,
              collection.name,
              vscode.TreeItemCollapsibleState.None,
              this.cacheService,
              undefined,
              favorites.has(collection.name),
              collection.isSearchResult
            );
            collectionList.push(collectionTreeItem);
          } catch (err: any) {
            logger.error("Failed to load Collections");
            logger.debug(err);
            throw new Error(err);
          }
        }
        if (hasMore) {
          collectionList.push(new PagerNode(this));
        }
        return collectionList;
      }
}
