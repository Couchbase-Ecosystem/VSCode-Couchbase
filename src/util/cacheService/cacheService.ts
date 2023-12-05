import { BucketSettings, CollectionSpec, ScopeSpec } from "couchbase";
import { IConnection } from "../../types/IConnection";
import { logger } from "../../logger/logger";
import { getActiveConnection } from "../connections";
import { hasQueryService } from "../common";

type schemaPatternType = ISchemaPatternCache | string;

export interface ISchemaPatternCache {
    schemaNode: Map<string, schemaPatternType>;
}

export interface ISchemaCache {
    patterns: ISchemaPatternCache[];
}

export interface ICollectionCache {
    name: string;
    scopeName: string;
    bucketName: string;
    schema?: ISchemaCache;
}

export interface IScopeCache {
    collections: Map<string, ICollectionCache>;
    name: string;
    bucketName: string;
}

export interface IBucketCache {
    scopes: Map<string, IScopeCache>;
    name: string;
    connection: IConnection;
}

export class CacheService {
    private bucketsData: Map<string, IBucketCache> = new Map();
    public cacheStatus: boolean = false;

    CacheService() { }

    private schemaTreeTraversal(treeNode: any): ISchemaPatternCache {
        if (!treeNode) {
            return {schemaNode: new Map<string, schemaPatternType>()};
        }
        const currentNodes = new Map<string,schemaPatternType>();
        
        Object.entries(treeNode).map(property => {
            const propertyValue: any = property[1];
            const type = propertyValue.type;
            if (type === 'object') {
                const children = this.schemaTreeTraversal(propertyValue.properties);
                currentNodes.set(`${property[0]}`, children);
            } else if (type === 'array') {
                try {
                    const items = propertyValue.items;
                    const itemType = items.type;
                    if (itemType === 'object') {
                        const children = this.schemaTreeTraversal(items.properties);
                        
                        currentNodes.set(`${property[0]}`, children);
                        
                    } else {
                        currentNodes.set(`${property[0]}`, `array of ${itemType}`);
                        
                    }
                } catch (error) {
                    logger.error(`Error processing array type for ${property[0]}: ${error}`);
                }
            } else {
                // Leaf node condition
                try {
                    let currentType: string = type.toString();
                    currentType = currentType.replace(',', " | ");
                    currentNodes.set(`${property[0]}`,currentType);
                   
                } catch (e) {
                    logger.error("Type can't be stringified: " + e);
                }
            }
        });
        return {schemaNode: currentNodes};
    }

    public cacheSchemaForCollection = async (connection: IConnection, collection: ICollectionCache) => {
        try {
            const query = "INFER `" + collection.bucketName + "`.`" + collection.scopeName + "`.`" + collection.name + "` WITH {\"sample_size\": 2000}";
            const result = await connection?.cluster?.query(query);
            
            const patternCnt: number = result?.rows[0].length || 0;
            const schemaPatternData: ISchemaPatternCache[] = [];
            for (let i = 0; i < patternCnt; i++) {
                const row = result?.rows[0][i];
                const childrenNode = this.schemaTreeTraversal(row.properties);
                schemaPatternData.push(childrenNode);
            }
            collection.schema = {patterns: schemaPatternData};
        } catch (error) {
            logger.error(`error while caching schema for a collection: ${collection.bucketName}.${collection.scopeName}.${collection.name}, error: ${error}`);
        }
    };

    // This function focuses on complete caching of schema of each collection which are saved in bucket cache
    public cacheSchemaForAllBuckets = async (connection: IConnection) => {
        for(let [_, bucket] of this.bucketsData){
            for(let [_, scope] of bucket.scopes){
                for(let [_,collection] of scope.collections){
                    await this.cacheSchemaForCollection(connection, collection);
                };
            };
        };
    };

    // This function focuses on caching the scopes and collections data for one particular bucket
    public cacheBucket = async (connection: IConnection, bucketName: string) => {
        const scopesData: Map<string, IScopeCache> = new Map();
        let scopes = await connection.cluster
            ?.bucket(bucketName)
            .collections()
            .getAllScopes();
        if(scopes){
            for(let scope of scopes) {
                const collectionsData: Map<string, ICollectionCache> = new Map();
                for(let collection of scope.collections)  {
                    collectionsData.set(collection.name, {
                        name: collection.name,
                        scopeName: scope.name,
                        bucketName: bucketName
                    });
                };

                scopesData.set(scope.name, {
                    collections: collectionsData,
                    name: scope.name,
                    bucketName: bucketName
                });
            };
            this.bucketsData.set(bucketName, {
                scopes: scopesData,
                name: bucketName,
                connection: connection
            });
        }
    }

    // This function focuses on caching the scopes and collections data for each bucket
    public cacheAllBuckets = async (connection: IConnection) => {
        this.bucketsData = new Map(); // Remove any existing cache
        try {
            let buckets = await connection.cluster?.buckets().getAllBuckets();
            if(buckets === undefined){
                logger.debug("Error while fetching buckets and returned undefined");
                return;
            }
            for(let bucket of buckets) {
                this.cacheBucket(connection, bucket.name);
            };
            
        } catch (error) {
            logger.error("Error while caching all collections " + error);
        }
    };

    public fullCache = async() => {
        const connection = getActiveConnection();
        if(connection){
            this.cacheStatus = false;
            await this.cacheAllBuckets(connection);
            if(hasQueryService(connection.services)){
                await this.cacheSchemaForAllBuckets(connection);
            }
            this.cacheStatus = true;
        }
    };
}