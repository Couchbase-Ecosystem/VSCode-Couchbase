import { IConnection } from "../../types/IConnection";
import { logger } from "../../logger/logger";
import { getActiveConnection } from "../connections";
import { hasQueryService } from "../common";
import { Global } from "../util";
import { QueryIndex } from "couchbase";

// type schemaPatternType = ISchemaPatternCache | string;

// export interface ISchemaPatternCache {
//     schemaNode: any;
// }
export type SchemaCacheType = { [index: string]: any };
export interface ISchemaCache {
    patterns: SchemaCacheType[];
}

export interface ICollectionCache {
    name: string;
    scopeName: string;
    bucketName: string;
    schema?: ISchemaCache;
    indexes?: string[];
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
    private cacheStatus: boolean = false;

    CacheService() { }

    private schemaTreeTraversal(treeNode: any): SchemaCacheType {
        if (!treeNode) {
            return {};
        }
        const currentNodes: SchemaCacheType = {};

        Object.entries(treeNode).map(property => {
            const propertyValue: any = property[1];
            const type = propertyValue.type;
            if (type === 'object') {
                const children = this.schemaTreeTraversal(propertyValue.properties);
                currentNodes[property[0]] =  children;
            } else if (type === 'array') {
                try {
                    const items = propertyValue.items;
                    const itemType = items.type;
                    if (itemType === 'object') {
                        const children = this.schemaTreeTraversal(items.properties);
                        currentNodes[property[0]] = children;
                    } else {
                        currentNodes[property[0]] =  `array of ${itemType}`;
                    }
                } catch (error) {
                    logger.error(`Error processing array type for ${property[0]}: ${error}`);
                }
            } else {
                // Leaf node condition
                try {
                    let currentType: string = type.toString();
                    currentType = currentType.replace(',', " | ");
                    currentNodes[property[0]] =  currentType;
                } catch (e) {
                    logger.error("Type can't be stringified: " + e);
                }
            }
        });
        return currentNodes;
    }

    public cacheSchemaForCollection = async (connection: IConnection, collection: ICollectionCache) => {
        try {
            const query = "INFER `" + collection.bucketName + "`.`" + collection.scopeName + "`.`" + collection.name + "` WITH {\"sample_size\": 2000}";
            const result = await connection?.cluster?.query(query);

            const patternCnt: number = result?.rows[0].length || 0;
            const schemaPatternData: SchemaCacheType[] = [];
            for (let i = 0; i < patternCnt; i++) {
                const row = result?.rows[0][i];
                const childrenNode = this.schemaTreeTraversal(row.properties);
                schemaPatternData.push(childrenNode);
            }
            collection.schema = { patterns: schemaPatternData };
        } catch (error) {
            logger.error(`error while caching schema for a collection: ${collection.bucketName}.${collection.scopeName}.${collection.name}, error: ${error}`);
        }
    };

    public async cacheIndexesForCollection(connection: IConnection, collection: ICollectionCache): Promise<QueryIndex[]> {
        const indexesResult = await connection?.cluster?.queryIndexes().getAllIndexes(collection.bucketName, { scopeName: collection.scopeName, collectionName: collection.name });
        collection.indexes = indexesResult?.map((index) => {
            return JSON.stringify(index);
        });
        return indexesResult || [];
    }

    // This function focuses on complete caching of schema of each collection which are saved in bucket cache
    public cacheIndexesAndSchemaForAllBuckets = async (connection: IConnection) => {
        for (let [_, bucket] of this.bucketsData) {
            for (let [_, scope] of bucket.scopes) {
                for (let [_, collection] of scope.collections) {
                    const indexes = await this.cacheIndexesForCollection(connection, collection);
                    if (indexes.length > 0) { // Only cache schema 
                        await this.cacheSchemaForCollection(connection, collection);
                    }
                };
            };
        };
        logger.info("caching of schema for all buckets done");
    };

    // This function focuses on caching the scopes and collections data for one particular bucket
    public cacheBucket = async (connection: IConnection, bucketName: string) => {
        const scopesData: Map<string, IScopeCache> = new Map();
        let scopes = await connection.cluster
            ?.bucket(bucketName)
            .collections()
            .getAllScopes();
        if (scopes) {
            for (let scope of scopes) {
                const collectionsData: Map<string, ICollectionCache> = new Map();
                for await (let collection of scope.collections) {
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
    };

    // This function focuses on caching the scopes and collections data for each bucket
    public cacheAllBuckets = async (connection: IConnection) => {
        this.bucketsData = new Map(); // Remove any existing cache
        try {
            let buckets = await connection.cluster?.buckets().getAllBuckets();
            if (buckets === undefined) {
                logger.debug("Error while fetching buckets and returned undefined");
                return;
            }
            for await (let bucket of buckets) {
                await this.cacheBucket(connection, bucket.name);
            };

        } catch (error) {
            logger.error("Error while caching all collections " + error);
        }
    };

    public fullCache = async (forcedCacheUpdate: boolean) => {
        const connection = getActiveConnection();
        if (connection) {
            if (!forcedCacheUpdate) {
                const isCacheSuccessful = await this.loadCache(connection);
                if (isCacheSuccessful) {
                    this.cacheStatus = true;
                    return;
                }
            }
            this.cacheStatus = false;
            await this.cacheAllBuckets(connection);
            if (hasQueryService(connection.services)) {
                await this.cacheIndexesAndSchemaForAllBuckets(connection);
            }
            this.cacheStatus = true;
            this.storeCache(connection);
        }
    };

    public getCacheStatus() {
        return this.cacheStatus;
    }

    public getCollectionWithBucketAndScopeName = async (bucketName: string, scopeName: string, collectionName: string): Promise<undefined | ICollectionCache> => {
        if (this.cacheStatus === false) {
            return undefined;
        }
        const bucketCache = this.bucketsData.get(bucketName);
        if(!bucketCache){
            return undefined;
        }

        const scopeData = bucketCache.scopes.get(scopeName);
        if (scopeData === undefined) {
            return undefined;
        }
        
        const collectionData = scopeData.collections.get(collectionName);
        if (collectionData === undefined) {
            return undefined;
        }
        
        return collectionData;

    };

    public getCollectionWithScopeName = async (scopeName: string, collectionName: string): Promise<undefined | ICollectionCache> => {
        if (this.cacheStatus === false) {
            return undefined;
        }
        for await (let [_, bucketCache] of this.bucketsData) {
            const scopeData = bucketCache.scopes.get(scopeName);
            if (scopeData !== undefined) {
                const collectionData = scopeData.collections.get(collectionName);
                if (collectionData !== undefined) {
                    // required data is found
                    return collectionData;
                }
            }
        }
        return undefined;

    };

    public getCollectionWithCollectionName = async (collectionName: string): Promise<undefined | ICollectionCache> => {
        if (this.cacheStatus === false) {
            return undefined;
        }
        for await (let [_, bucketCache] of this.bucketsData) {
            for await (let [_, scopeCache] of bucketCache.scopes) {
                const collections = scopeCache.collections;
                if (collections !== undefined) {
                    const collectionData = collections.get(collectionName);
                    if (collectionData !== undefined) {
                        // required data is found
                        return collectionData;
                    }
                }
            }
        }
        return undefined;
    };

    public getAllCollections = async () => {
        if (this.cacheStatus === false) {
            return [];
        }
        const allCollectionList = [];
        for await (let [_, bucketCache] of this.bucketsData) {
            for await (let [_, scopeCache] of bucketCache.scopes) {
                for await (let [_, collectionCache] of scopeCache.collections) {
                    allCollectionList.push(`${collectionCache.scopeName}.${collectionCache.name}`);
                }
            }
        }
        return allCollectionList;
    };

    private serializeSchema(schema: ISchemaCache): string {
        // Convert nested Maps to plain objects for JSON
        const patternsJson = JSON.stringify(schema.patterns);
        return patternsJson;
        //return JSON.stringify({ patterns: patternsJson });
    }

    public async storeCache(connection: IConnection): Promise<void> {
        const serializedData: any = {};
        // Serialize each bucket in the map
        for (const [bucketName, bucket] of this.bucketsData) {
            serializedData[bucketName] = {
                name: bucket.name,
                scopes: {},
                connection: bucket.connection, // Assume serializable
            };
            // Serialize each scope in the bucket's map
            for (const [scopeName, scope] of bucket.scopes) {
                serializedData[bucketName].scopes[scopeName] = {
                    name: scope.name,
                    collections: {},
                    bucketName: bucketName
                };
                // Serialize each collection in the scope's map
                for (const [collectionName, collection] of scope.collections) {
                    serializedData[bucketName].scopes[scopeName].collections[collectionName] = {
                        name: collection.name,
                        schema: collection.schema ? this.serializeSchema(collection.schema) : undefined,
                        scopeName: scopeName,
                        bucketName: bucketName,
                        indexes: collection.indexes
                    };
                }
            }
        }

        const finalJson = JSON.stringify(serializedData);
        Global.state.update(`vscode-couchbase.iq.bucketsCache.${connection.connectionIdentifier}`, finalJson);
        // return vscode.globalState.update(BUCKETS_STATE_KEY, finalJson);
    }

    private async loadCache(connection: IConnection): Promise<boolean> {
        const storedDataJson = Global.state.get<string>(`vscode-couchbase.iq.bucketsCache.${connection.connectionIdentifier}`);
        if (!storedDataJson) {
            return false; // No existing cache
        }
        logger.info("Loading existing cache");
        const storedData = JSON.parse(storedDataJson);
        this.bucketsData.clear();
        for (const bucketName in storedData) {
            const bucket: IBucketCache = {
                name: storedData[bucketName].name,
                connection: storedData[bucketName].connection, // Assume deserializable
                scopes: new Map(),
            };
            this.bucketsData.set(bucketName, bucket);
            logger.info("loading cache from bucket: "+ bucketName);

            for (const scopeName in storedData[bucketName].scopes) {
                const scope: IScopeCache = {
                    name: storedData[bucketName].scopes[scopeName].name,
                    bucketName: bucketName,
                    collections: new Map(),
                };
                bucket.scopes.set(scopeName, scope);

                for (const collectionName in storedData[bucketName].scopes[scopeName].collections) {
                    console.log(bucketName,scopeName, collectionName);
                    const collection: ICollectionCache = {
                        name: storedData[bucketName].scopes[scopeName].collections[collectionName].name,
                        schema: storedData[bucketName].scopes[scopeName].collections[collectionName].schema
                            ? this.deserializeSchema(storedData[bucketName].scopes[scopeName].collections[collectionName].schema)
                            : undefined,
                        indexes: storedData[bucketName].scopes[scopeName].collections[collectionName].indexes,
                        scopeName: scopeName,
                        bucketName: bucketName
                    };
                    scope.collections.set(collectionName, collection);
                }
            }
        }
        return true;
    }

    private deserializeSchema(storedSchemaJson: string): ISchemaCache | undefined {
        
        
        if (!storedSchemaJson) {
            return undefined;
        }

        const patterns = JSON.parse(storedSchemaJson);
        return {
            patterns: patterns.map((pattern: any):SchemaCacheType => {
                return pattern; // Convert empty array to Map
            }),
        };

    }
}