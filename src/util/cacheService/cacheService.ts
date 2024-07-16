import { IConnection } from "../../types/IConnection";
import { logger } from "../../logger/logger";
import { getActiveConnection } from "../connections";
import { hasQueryService } from "../common";
import { Global } from "../util";
import { QueryIndex } from "couchbase";
import { QueryResult } from "couchbase";
import { CouchbaseError } from 'couchbase'

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
    timeStamp?: Date;
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
    timeStamp: Date;
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
                currentNodes[property[0]] = {
                    type: 'object',
                    value: children
                };
            } else if (type === 'array') {
                try {
                    const items = propertyValue.items;
                    const itemType = items.type;
                    if (itemType === 'object') {
                        const children = this.schemaTreeTraversal(items.properties);
                        currentNodes[property[0]] = {
                            type: 'array',
                            value: children
                        };
                    } else {
                        currentNodes[property[0]] = {
                            type: 'array',
                            value: `array of ${itemType}`
                        };;
                    }
                } catch (error) {
                    logger.error(`Error processing array type for ${property[0]}: ${error}`);
                }
            } else {
                // Leaf node condition
                try {
                    let currentType: string = type.toString();
                    currentType = currentType.replace(',', " | ");
                    currentNodes[property[0]] = {
                        type: currentType,
                        value: currentType
                    };
                } catch (e) {
                    logger.error("Type can't be stringified: " + e);
                }
            }
        });
        return currentNodes;
    }


    public cacheSchemaForCollection = async (connection: IConnection, collection: ICollectionCache, result?: QueryResult<any>) => {
        try {
            if (!result) {
                const query = "INFER `" + collection.bucketName + "`.`" + collection.scopeName + "`.`" + collection.name + "` WITH {\"sample_size\": 2000}";
                result = await connection?.cluster?.query(query);
            }
            const patternCnt: number = result?.rows[0].length || 0;
            const schemaPatternData: SchemaCacheType[] = [];
            for (let i = 0; i < patternCnt; i++) {
                const row = result?.rows[0][i];
                const childrenNode = this.schemaTreeTraversal(row.properties);
                schemaPatternData.push(childrenNode);
            }
            collection.schema = { patterns: schemaPatternData };
            collection.timeStamp = new Date();
        } catch (error: any) {
            if (error instanceof CouchbaseError && (error as any).cause?.first_error_code === 7014) {
                collection.schema = { patterns: [] };
                collection.timeStamp = new Date();
                logger.debug(`No documents found, unable to infer schema for a collection: ${collection.bucketName}.${collection.scopeName}.${collection.name}, error: ${error}`);
            }
            logger.error(`error while caching schema for a collection: ${collection.bucketName}.${collection.scopeName}.${collection.name}, error: ${error}`);
        }
    };

    public async cacheIndexesForCollection(connection: IConnection, collection: ICollectionCache, indexesResult?: QueryIndex[]): Promise<QueryIndex[]> {
        if (!indexesResult) {
            indexesResult = await connection?.cluster?.queryIndexes().getAllIndexes(collection.bucketName, { scopeName: collection.scopeName, collectionName: collection.name });
        }
        collection.indexes = indexesResult?.map((index) => {
            return JSON.stringify(index);
        });
        collection.timeStamp = new Date();
        return indexesResult || [];
    }

    // This function focuses on complete caching of schema of each collection which are saved in bucket cache
    public cacheIndexesAndSchemaForAllBuckets = async (connection: IConnection) => {
        for (let [_, bucket] of this.bucketsData) {
            for (let [_, scope] of bucket.scopes) {
                for (let [_, collection] of scope.collections) {
                    await this.cacheIndexesForCollection(connection, collection);
                    await this.cacheSchemaForCollection(connection, collection);
                };
            };
        };
        logger.info("caching of schema for all buckets done");
    };


    private cacheBucket = async (connection: IConnection, bucketName: string) => {
        try {
            const currentTimestamp = new Date();
            const scopesData: Map<string, IScopeCache> = new Map();
            const scopes = await connection.cluster
                ?.bucket(bucketName)
                .collections()
                .getAllScopes();
            if (scopes) {
                const existingBucketData = this.bucketsData.get(bucketName);
                const existingScopes = existingBucketData ? existingBucketData.scopes : new Map<string, IScopeCache>();
                for (const scope of scopes) {
                    const collectionsData: Map<string, ICollectionCache> = new Map();
                    const existingScope = existingScopes.get(scope.name);

                    for (const collection of scope.collections) {
                        const existingCollection = existingScope ? existingScope.collections.get(collection.name) : undefined;
                        collectionsData.set(collection.name, {
                            name: collection.name,
                            scopeName: scope.name,
                            bucketName: bucketName,
                            schema: existingCollection ? existingCollection.schema : undefined,
                            indexes: existingCollection ? existingCollection.indexes : undefined,
                            timeStamp: existingCollection ? existingCollection.timeStamp : currentTimestamp,
                        });
                    }

                    scopesData.set(scope.name, {
                        collections: collectionsData,
                        name: scope.name,
                        bucketName: bucketName,
                    });
                }

                this.bucketsData.set(bucketName, {
                    scopes: scopesData,
                    name: bucketName,
                    connection: connection,
                    timeStamp: currentTimestamp,
                });
            }
        } catch (error) {
            logger.error(`Error while caching bucket '${bucketName}': ${error}`);
        }
    };

    //Refreshes the cache for all buckets if they are older than timeout or force refresh or not present in the cache
    private refreshBucketCache = async (connection: IConnection, bucketTimeOut: number, forceRefresh: boolean) => {
        try {
            const buckets = await connection.cluster?.buckets().getAllBuckets();
            if (!buckets) {
                logger.debug("Error while fetching buckets and returned undefined");
                return;
            }

            const currentTimestamp = new Date();

            for (const bucket of buckets) {
                const cachedBucket = this.bucketsData.get(bucket.name);
                const bucketExistsInCache = !!cachedBucket;
                if (!bucketExistsInCache) {
                    await this.cacheBucket(connection, bucket.name);
                } else {
                    const bucketTimestamp = new Date(cachedBucket.timeStamp);
                    const timeDifferenceMinutes = (currentTimestamp.getTime() - bucketTimestamp.getTime()) / (1000 * 60);
                    if (timeDifferenceMinutes > bucketTimeOut || forceRefresh) {
                        await this.cacheBucket(connection, bucket.name);
                    } else {
                        logger.info(`Bucket '${bucket.name}' cache timestamp within threshold minutes, no update needed.`);
                    }
                }
            }
        } catch (error) {
            logger.error("Error while refreshing bucket cache" + error);
        }
    }


    // Refreshes the cache by updating bucket and collection cache if timestamps are older than timeouts specified/ force refresh is true
    private refreshCache = async (connection: IConnection, bucketTimeOut: number, collectionTimeout: number, forceRefresh: boolean) => {
        try {
            await this.refreshBucketCache(connection, bucketTimeOut, forceRefresh);
            this.cacheStatus = true;
            await this.refreshOutdatedCollections(connection, collectionTimeout, forceRefresh);

        } catch (error) {
            logger.error("Error while refreshing cache" + error);
        }
    };

    // Refreshes the outdated collection cache if timestamps are older than timeouts specified/ force refresh is true
    private async refreshOutdatedCollections(connection: IConnection, collectionTimeout: number, forceRefresh: boolean) {
        for (const [_, bucket] of this.bucketsData) {
            for (const [_, scope] of bucket.scopes) {
                for (const [_, collection] of scope.collections) {
                    await this.refreshCollectionSchemaCache(connection, collection.bucketName, collection.scopeName, collection.name, collectionTimeout, forceRefresh);
                    if (forceRefresh) {
                        await this.refreshCollectionIndexCache(connection, collection.bucketName, collection.scopeName, collection.name);
                    }
                }
            }
        }
    }


    // Checks and refreshes the cache for timeout.If the cache is loaded successfully, it refreshes the cache by updating bucket and collection cache if required
    public refreshCacheOnTimeout = async (bucketTimeOut: number, collectionTimeout: number, forceRefresh: boolean) => {

        const connection = getActiveConnection();
        if (connection) {
            const isCacheSuccessful = await this.loadCache(connection);
            if (isCacheSuccessful) {
                await this.refreshCache(connection, bucketTimeOut, collectionTimeout, forceRefresh);
                this.cacheStatus = true;
                await this.storeCache(connection);
            }
            else {
                await this.fullCache(true);
            }
        }
    }


    // Refreshes the index and schema cache for a single collection if necessary
    private refreshCollectionSchemaCache = async (connection: IConnection, bucketName: string, scopeName: string, collectionName: string, collectionTimeout: number, forceRefresh: boolean, queryResult?: QueryResult<any>) => {
        const currentTimestamp = new Date();
        if (this.cacheStatus === false) {
            return undefined;
        }

        const bucketCache = this.bucketsData.get(bucketName);
        if (!bucketCache) {
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



        if (!collectionData.timeStamp) {
            collectionData.timeStamp = currentTimestamp;
        }

        const collectionTimestamp = new Date(collectionData.timeStamp);
        let minsDifference = 0
        const difference = currentTimestamp.getTime() - collectionTimestamp.getTime();
        if (difference != 0) {
            minsDifference = difference / (1000 * 60);
        }

        if (minsDifference > collectionTimeout || minsDifference === 0 || forceRefresh) {
            if (hasQueryService(connection.services)) {
                await this.cacheSchemaForCollection(connection, collectionData, queryResult);
            }
        }

    }

    // Refreshes the index cache for a single collection
    private refreshCollectionIndexCache = async (connection: IConnection, bucketName: string, scopeName: string, collectionName: string, indexesResult?: QueryIndex[]) => {
        if (this.cacheStatus === false) {
            return undefined;
        }
        const bucketCache = this.bucketsData.get(bucketName);
        if (!bucketCache) {
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
        if (hasQueryService(connection.services)) {
            const indexes = await this.cacheIndexesForCollection(connection, collectionData, indexesResult);
        }
    }

    // Updates the Bucket cache if required
    public updateBucketCache = async (bucketName: string, forceRefresh: boolean) => {
        const connection = getActiveConnection();
        if (connection) {
            const isCacheSuccessful = await this.loadCache(connection);
            if (isCacheSuccessful) {
                if (forceRefresh) {
                    await this.cacheBucket(connection, bucketName);
                    this.cacheStatus = true;
                    await this.storeCache(connection);
                }
            }
            else {
                await this.fullCache(true);
            }
        }
    }


    // Updates the Index cache for a particular collection if required
    public updateCollectionIndexCache = async (connection: IConnection, bucketName: string, scopeName: string, collectionName: string, indexesResult?: QueryIndex[]) => {
        if (this.cacheStatus === false) {
            return undefined;
        }
        if (connection) {
            const isCacheSuccessful = await this.loadCache(connection);
            if (isCacheSuccessful) {
                await this.refreshCollectionIndexCache(connection, bucketName, scopeName, collectionName, indexesResult);
                await this.storeCache(connection);
            }
            else {
                await this.fullCache(true);
            }

        }

    }

    // Updates the Schema cache for a particular collection if required
    public updateCollectionSchemaCache = async (connection: IConnection, bucketName: string, scopeName: string, collectionName: string, collectionTimeout: number, forceRefresh: boolean, queryResult?: QueryResult<any>) => {
        if (this.cacheStatus === false) {
            return undefined;
        }
        if (connection) {
            const isCacheSuccessful = await this.loadCache(connection);
            if (isCacheSuccessful) {
                await this.refreshCollectionSchemaCache(connection, bucketName, scopeName, collectionName, collectionTimeout, forceRefresh, queryResult);
                await this.storeCache(connection);
            }
            else {
                await this.fullCache(true);
            }

        }
    }

    // Updates the Index cache and Schema cache for a particular collection if required
    public async updateCollectionSchemaAndIndexCache(connection: IConnection, bucketName: string, scopeName: string, collectionName: string, collectionTimeout: number, forceRefresh: boolean, result?: QueryResult<any>, indexesResult?: QueryIndex[]) {
        if (this.cacheStatus === false) {
            return undefined;
        }
        if (connection) {
            const isCacheSuccessful = await this.loadCache(connection);
            if (isCacheSuccessful) {
                await this.refreshCollectionSchemaCache(connection, bucketName, scopeName, collectionName, collectionTimeout, forceRefresh);
                if (forceRefresh) {
                    await this.refreshCollectionIndexCache(connection, bucketName, scopeName, collectionName, indexesResult);
                }
                await this.storeCache(connection);
            }
            else {
                await this.fullCache(true);
            }
        }
    }

    // Clears the existing cache from memory and does a full cache
    public async clearAndRefreshCache(connection: IConnection, forceRefresh: boolean) {
        if (connection) {
            Global.state.update(`vscode-couchbase.iq.bucketsCache.${connection.connectionIdentifier}`, "");
            this.bucketsData.clear();
            await this.fullCache(true);

        }

    }

    public updateBucketsData(bucketName: string, bucket: IBucketCache) {
        this.bucketsData.clear();
        this.cacheStatus = true;
        this.bucketsData.set(bucketName, bucket);
    }

    public getBucketData(bucketName: string): IBucketCache | undefined {
        return this.bucketsData.get(bucketName);
    }


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
            }
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
        if (!bucketCache) {
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
    }

    public async storeCache(connection: IConnection): Promise<void> {
        const serializedData: any = {};
        // Serialize each bucket in the map
        for (const [bucketName, bucket] of this.bucketsData) {
            serializedData[bucketName] = {
                name: bucket.name,
                scopes: {},
                connection: bucket.connection, // Assume serializable
                timeStamp: bucket.timeStamp
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
                        indexes: collection.indexes,
                        timeStamp: collection.timeStamp,
                    };
                }
            }
        }

        const finalJson = JSON.stringify(serializedData);
        Global.state.update(`vscode-couchbase.iq.bucketsCache.${connection.connectionIdentifier}`, finalJson);
        // return vscode.globalState.update(BUCKETS_STATE_KEY, finalJson);
    }

    public getCache(bucketName:string){
        return this.bucketsData.get(bucketName)
    }

    public async loadCache(connection: IConnection): Promise<boolean> {
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
                timeStamp: storedData[bucketName].timeStamp,
            };
            this.bucketsData.set(bucketName, bucket);
            logger.info("loading cache from bucket: " + bucketName);

            for (const scopeName in storedData[bucketName].scopes) {
                const scope: IScopeCache = {
                    name: storedData[bucketName].scopes[scopeName].name,
                    bucketName: bucketName,
                    collections: new Map(),
                };
                bucket.scopes.set(scopeName, scope);

                for (const collectionName in storedData[bucketName].scopes[scopeName].collections) {
                    const collection: ICollectionCache = {
                        name: storedData[bucketName].scopes[scopeName].collections[collectionName].name,
                        schema: storedData[bucketName].scopes[scopeName].collections[collectionName].schema
                            ? this.deserializeSchema(storedData[bucketName].scopes[scopeName].collections[collectionName].schema)
                            : undefined,
                        indexes: storedData[bucketName].scopes[scopeName].collections[collectionName].indexes,
                        scopeName: scopeName,
                        bucketName: bucketName,
                        timeStamp: storedData[bucketName].scopes[scopeName].collections[collectionName].timeStamp,
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
            patterns: patterns.map((pattern: any): SchemaCacheType => {
                return pattern; // Convert empty array to Map
            }),
        };

    }
}