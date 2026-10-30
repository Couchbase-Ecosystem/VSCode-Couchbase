import { IConnection } from "../../types/IConnection";
import { CacheService } from "./cacheService";
import { IBucketCache } from "./cacheService";
import { IScopeCache } from "./cacheService";
import { ICollectionCache } from "./cacheService";

jest.mock(
    "vscode",
    () => ({
        workspace: {
            onDidChangeConfiguration: jest.fn(),
            getConfiguration: jest.fn(() => ({
                get: jest.fn(),
            })),
        },
        window: {
            createOutputChannel: jest.fn().mockReturnValue({
                appendLine: jest.fn(),
                show: jest.fn(),
            }),
        },

    }),
    { virtual: true }
);

jest.mock("../common", () => ({
    ...jest.requireActual("../common"),
    hasQueryService: jest.fn(() => true),
}));

jest.mock('../connections', () => {
    const bucketManagerMock = {
        getAllBuckets: jest.fn().mockResolvedValue([{ name: "exampleBucket" }]),
    };
    const collectionsMock = {
        getAllScopes: jest.fn().mockResolvedValue([
            { name: "exampleScope", collections: [{ name: "exampleCollection" }] },
            { name: "exampleScope2", collections: [{ name: "exampleCollection" }] },
        ]),
    };

    const mockCluster = {
        buckets: () => bucketManagerMock,
        bucket: jest.fn().mockImplementation((bucketName) => ({
            collections: () => collectionsMock,
        })),
        query: jest.fn().mockResolvedValue({
            rows: [{ properties: { exampleCollection: {} } }],
        }),
    };

    return {
        getActiveConnection: jest.fn().mockReturnValue({
            url: "https://example.com",
            username: "username",
            connectionIdentifier: "someConnectionId",
            isSecure: true,
            cluster: mockCluster
        })
    };
});


// Helper method to create sample Bucket cache
function createBucketCache(mockConnection: IConnection, bucketTimeStamp: Date, collectionTimeStamp: Date, schema?: ICollectionCache["schema"]) {
    const exampleCollectionCache: ICollectionCache = {
        name: "exampleCollection",
        scopeName: "exampleScope",
        bucketName: "exampleBucket",
        indexes: ["index1", "index2"],
        timeStamp: collectionTimeStamp,
        schema,
    };

    const exampleScopeCache: IScopeCache = {
        collections: new Map([
            ["exampleCollection", exampleCollectionCache],
        ]),
        name: "exampleScope",
        bucketName: "exampleBucket",
    };

    const exampleBucketCache: IBucketCache = {
        scopes: new Map([["exampleScope", exampleScopeCache]]),
        name: "exampleBucket",
        connection: mockConnection,
        timeStamp: bucketTimeStamp,
    };

    return exampleBucketCache;
}



jest.setTimeout(20000);

describe("Given CacheService is responsible for refreshing the caching of couchbase entities such as Buckets, Scopes, and Collections, it", () => {
    const mockConnection: IConnection = {
        url: "https://example.com",
        username: "username",
        connectionIdentifier: "someConnectionId",
        isSecure: true,
    };

    let cacheService: CacheService;

    beforeEach(async () => {


        cacheService = new CacheService();
        // Not mocking the Memory state calls associated with the methods loadCache, storeCache, instead mocked the whole method, as the below tests focuses mainly 
        // on testing the refresh/update of the Cache and not on the implementation of loadCache/storeCache itself
        jest.spyOn(cacheService, "loadCache").mockImplementation(() =>
            Promise.resolve(true)
        );
        jest.spyOn(cacheService, "storeCache").mockResolvedValue();

    });

    it("should correctly handle refreshing of buckets older than 10minutes", async () => {
        // Time stamp, more than ten minutes
        const tenMinutesAgo = new Date(new Date().getTime() - 11 * 60 * 1000);

        const exampleBucketCache = createBucketCache(mockConnection, tenMinutesAgo, tenMinutesAgo);
        // Helper method to set this.BucketsData 
        cacheService.updateBucketsData("exampleBucket", exampleBucketCache);
        await cacheService.refreshCacheOnTimeout(10, 10, false);
        // Helper method to get this.BucketsData
        const updatedCache = cacheService.getBucketData("exampleBucket");
        if (updatedCache && updatedCache.timeStamp) {
            const cacheTimeStamp = exampleBucketCache?.timeStamp
                ? new Date(updatedCache.timeStamp)
                : new Date();
            // Assert that cacheAgeMinutes is not equal to what it was 10minutes ago and scope cache is updated
            expect(cacheTimeStamp).not.toEqual(tenMinutesAgo);
            expect(updatedCache.scopes.size).toEqual(2);
        }
    });

    it("should correctly handle not refreshing of buckets within 10minutes", async () => {
        const currentTime = new Date(new Date().getTime());

        const exampleBucketCache = createBucketCache(mockConnection, currentTime, currentTime);

        cacheService.updateBucketsData("exampleBucket", exampleBucketCache);

        await cacheService.refreshCacheOnTimeout(10, 10, false);
        const updatedCache = cacheService.getBucketData("exampleBucket");

        if (updatedCache && updatedCache.timeStamp) {
            const cacheTimeStamp = exampleBucketCache?.timeStamp
                ? new Date(updatedCache.timeStamp)
                : new Date();
            // Assert that cacheAgeMinutes is equal to what it was few minutes ago
            expect(cacheTimeStamp).toEqual(currentTime);
            expect(updatedCache.scopes.size).not.toEqual(2);
        }
    });

    it("should correctly handle not refreshing of buckets within 10minutes", async () => {
        const currentTime = new Date(new Date().getTime());

        const exampleBucketCache = createBucketCache(mockConnection, currentTime, currentTime);

        cacheService.updateBucketsData("exampleBucket", exampleBucketCache);

        await cacheService.refreshCacheOnTimeout(10, 10, false);
        const updatedCache = cacheService.getBucketData("exampleBucket");

        if (updatedCache && updatedCache.timeStamp) {
            const cacheTimeStamp = exampleBucketCache?.timeStamp
                ? new Date(updatedCache.timeStamp)
                : new Date();
            // Assert that cacheAgeMinutes is equal to what it was few minutes ago
            expect(cacheTimeStamp).toEqual(currentTime);
            expect(updatedCache.scopes.size).not.toEqual(2);
        }
    });

    it("should correctly handle refreshing of ONLY collection cache for buckets older than 10minutes", async () => {
        // Time stamp, more than ten minutes
        const tenMinutesAgo = new Date(new Date().getTime() - 15 * 60 * 1000);
        const currentTime = new Date(new Date().getTime());

        // A collection whose schema was loaded earlier, so its expired cache gets refreshed
        const exampleBucketCache = createBucketCache(mockConnection, currentTime, tenMinutesAgo, { patterns: [] });

        cacheService.updateBucketsData("exampleBucket", exampleBucketCache);

        await cacheService.refreshCacheOnTimeout(10, 10, false);
        const updatedCache = cacheService.getBucketData("exampleBucket");

        if (!updatedCache) {
            throw new Error("updatedCache is undefined");
        }

        const updatedScopeCache = updatedCache.scopes.get("exampleScope");
        if (!updatedScopeCache) {
            throw new Error("exampleScopeCache is undefined");
        }

        const updatedCollectionCache =
            updatedScopeCache.collections.get("exampleCollection");
        if (!updatedCollectionCache) {
            throw new Error("updatedCollectionCache is undefined");
        }

        if (updatedCollectionCache.timeStamp) {
            const collectionCacheTimeStamp = new Date(
                updatedCollectionCache.timeStamp
            );
            expect(collectionCacheTimeStamp).not.toEqual(tenMinutesAgo);
            expect(updatedCache.scopes.size).not.toEqual(2);
        }
    });

    it("should correctly handle force refreshing of ONLY the bucket cache ", async () => {
        // Time stamp, more than ten minutes
        const tenMinutesAgo = new Date(new Date().getTime() - 15 * 60 * 1000);

        const exampleBucketCache = createBucketCache(mockConnection, tenMinutesAgo, tenMinutesAgo);

        cacheService.updateBucketsData("exampleBucket", exampleBucketCache);

        await cacheService.updateBucketCache("exampleBucket", true);
        const updatedCache = cacheService.getBucketData("exampleBucket");

        if (updatedCache && updatedCache.timeStamp) {
            const cacheTimeStamp = exampleBucketCache?.timeStamp
                ? new Date(updatedCache.timeStamp)
                : new Date();
            // Assert that cacheAgeMinutes is not equal to what it was 10minutes ago
            expect(cacheTimeStamp).not.toEqual(tenMinutesAgo);
        }
    });

    it("should correctly handle refreshing of ONLY the schema cache of a particular collection in a bucket ", async () => {
        // Time stamp, more than ten minutes
        const tenMinutesAgo = new Date(
            new Date().getTime() - 15 * 60 * 1000
        );

        const exampleBucketCache = createBucketCache(mockConnection, tenMinutesAgo, tenMinutesAgo);

        cacheService.updateBucketsData("exampleBucket", exampleBucketCache);

        await cacheService.updateCollectionSchemaCache(
            mockConnection,
            "exampleBucket",
            "exampleScope",
            "exampleCollection",
            10,
            false
        );
        const updatedCache = cacheService.getBucketData("exampleBucket");

        if (!updatedCache) {
            throw new Error("updatedCache is undefined");
        }

        const updatedScopeCache = updatedCache.scopes.get("exampleScope");
        if (!updatedScopeCache) {
            throw new Error("exampleScopeCache is undefined");
        }

        const updatedCollectionCache =
            updatedScopeCache.collections.get("exampleCollection");
        if (!updatedCollectionCache) {
            throw new Error("updatedCollectionCache is undefined");
        }

        if (updatedCollectionCache.timeStamp) {
            const collectionCacheTimeStamp = new Date(
                updatedCollectionCache.timeStamp
            );
            expect(collectionCacheTimeStamp).not.toEqual(tenMinutesAgo);
        }
        if (updatedCache && updatedCache.timeStamp) {
            const cacheTimeStamp = exampleBucketCache?.timeStamp
                ? new Date(updatedCache.timeStamp)
                : new Date();
            // Assert that cacheAgeMinutes is equal to what it was 10minutes ago
            expect(cacheTimeStamp).toEqual(tenMinutesAgo);
        }
    });

    it("should correctly handle NOT refreshing of the schema cache of a particular collection in a bucket ", async () => {
        // Time stamp, less than ten minutes
        const currentTime = new Date(new Date().getTime() - 5 * 60 * 1000);

        const exampleBucketCache = createBucketCache(mockConnection, currentTime, currentTime);


        cacheService.updateBucketsData("exampleBucket", exampleBucketCache);

        await cacheService.updateCollectionSchemaCache(
            mockConnection,
            "exampleBucket",
            "exampleScope",
            "exampleCollection",
            10,
            false
        );
        const updatedCache = cacheService.getBucketData("exampleBucket");

        if (!updatedCache) {
            throw new Error("updatedCache is undefined");
        }

        const updatedScopeCache = updatedCache.scopes.get("exampleScope");
        if (!updatedScopeCache) {
            throw new Error("exampleScopeCache is undefined");
        }

        const updatedCollectionCache =
            updatedScopeCache.collections.get("exampleCollection");
        if (!updatedCollectionCache) {
            throw new Error("updatedCollectionCache is undefined");
        }

        if (updatedCollectionCache.timeStamp) {
            const collectionCacheTimeStamp = new Date(
                updatedCollectionCache.timeStamp
            );
            expect(collectionCacheTimeStamp).toEqual(currentTime);
        }
        if (updatedCache && updatedCache.timeStamp) {
            const cacheTimeStamp = exampleBucketCache?.timeStamp
                ? new Date(updatedCache.timeStamp)
                : new Date();
            // Assert that cacheAgeMinutes is equal to what it was previously as bucket cache is untouched
            expect(cacheTimeStamp).toEqual(currentTime);
        }
    });

    it("should correctly handle force refreshing of the schema cache of a particular collection in a bucket ", async () => {
        // Time stamp, less than ten minutes
        const currentTime = new Date(new Date().getTime() - 5 * 60 * 1000);

        const exampleBucketCache = createBucketCache(mockConnection, currentTime, currentTime);

        cacheService.updateBucketsData("exampleBucket", exampleBucketCache);

        await cacheService.updateCollectionSchemaCache(
            mockConnection,
            "exampleBucket",
            "exampleScope",
            "exampleCollection",
            10,
            true
        );
        const updatedCache = cacheService.getBucketData("exampleBucket");

        if (!updatedCache) {
            throw new Error("updatedCache is undefined");
        }

        const updatedScopeCache = updatedCache.scopes.get("exampleScope");
        if (!updatedScopeCache) {
            throw new Error("exampleScopeCache is undefined");
        }

        const updatedCollectionCache =
            updatedScopeCache.collections.get("exampleCollection");
        if (!updatedCollectionCache) {
            throw new Error("updatedCollectionCache is undefined");
        }

        if (updatedCollectionCache.timeStamp) {
            const collectionCacheTimeStamp = new Date(
                updatedCollectionCache.timeStamp
            );
            expect(collectionCacheTimeStamp).not.toEqual(currentTime);
        }
        if (updatedCache && updatedCache.timeStamp) {
            const cacheTimeStamp = exampleBucketCache?.timeStamp
                ? new Date(updatedCache.timeStamp)
                : new Date();
            // Assert that cacheAgeMinutes is equal to what it was previously as bucket cache is untouched
            expect(cacheTimeStamp).toEqual(currentTime);
        }
    });
    describe("with many collections, schemas are only loaded when used", () => {
        const { getActiveConnection } = require("../connections");
        const query = () => getActiveConnection().cluster.query as jest.Mock;

        beforeEach(() => query().mockClear());

        it("connecting caches collection names only, without any INFER query", async () => {
            await cacheService.fullCache(true);

            expect(query()).not.toHaveBeenCalled();
            expect(await cacheService.getAllCollections()).toEqual(
                expect.arrayContaining(["exampleScope.exampleCollection", "exampleScope2.exampleCollection"])
            );
        });

        it("does not re-infer collections that were never used when their cache expires", async () => {
            const expired = new Date(Date.now() - 15 * 60 * 1000);
            cacheService.updateBucketsData("exampleBucket", createBucketCache(mockConnection, new Date(), expired));

            await cacheService.refreshCacheOnTimeout(10, 10, false);

            expect(query()).not.toHaveBeenCalled();
        });

        it("loads a collection's schema the first time it is needed, then reuses it", async () => {
            cacheService.updateBucketsData("exampleBucket", createBucketCache(mockConnection, new Date(), new Date()));

            const first = await cacheService.ensureCollectionSchema("exampleBucket", "exampleScope", "exampleCollection");
            const second = await cacheService.ensureCollectionSchema("exampleBucket", "exampleScope", "exampleCollection");

            expect(query()).toHaveBeenCalledTimes(1);
            expect(query().mock.calls[0][0]).toContain("INFER `exampleBucket`.`exampleScope`.`exampleCollection`");
            expect(first?.schema?.patterns).toBeDefined();
            expect(second).toBe(first);
            expect(cacheService.storeCache).toHaveBeenCalled();
        });

        it("runs a single INFER when several features ask for the same schema at once", async () => {
            cacheService.updateBucketsData("exampleBucket", createBucketCache(mockConnection, new Date(), new Date()));

            await Promise.all([1, 2, 3].map(() =>
                cacheService.ensureCollectionSchema("exampleBucket", "exampleScope", "exampleCollection")));

            expect(query()).toHaveBeenCalledTimes(1);
        });

        it("re-infers a loaded schema once it is older than the collection cache expiry", async () => {
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
            cacheService.updateBucketsData("exampleBucket", createBucketCache(mockConnection, new Date(), twoDaysAgo, { patterns: [] }));

            await cacheService.ensureCollectionSchema("exampleBucket", "exampleScope", "exampleCollection");

            expect(query()).toHaveBeenCalledTimes(1);
        });

        it("keeps a recently loaded schema without querying", async () => {
            cacheService.updateBucketsData("exampleBucket", createBucketCache(mockConnection, new Date(), new Date(), { patterns: [] }));

            await cacheService.ensureCollectionSchema("exampleBucket", "exampleScope", "exampleCollection");

            expect(query()).not.toHaveBeenCalled();
        });

        it("does not retry a failed INFER on every request", async () => {
            cacheService.updateBucketsData("exampleBucket", createBucketCache(mockConnection, new Date(), new Date()));
            query().mockRejectedValueOnce(new Error("User does not have credentials to run INFER"));

            await cacheService.ensureCollectionSchema("exampleBucket", "exampleScope", "exampleCollection");
            await cacheService.ensureCollectionSchema("exampleBucket", "exampleScope", "exampleCollection");

            expect(query()).toHaveBeenCalledTimes(1);
            expect(cacheService.storeCache).not.toHaveBeenCalled();
        });

        // INFER whose answer the test releases by hand, to change things while it is in flight
        const pendingInfer = () => {
            let release: () => void = () => {};
            query().mockImplementationOnce(() => new Promise((resolve) => {
                release = () => resolve({ rows: [[{ properties: { orderId: { type: "string" } } }]] });
            }));
            return { release: () => release() };
        };

        it("keeps the schema when the cache is reloaded while INFER runs", async () => {
            cacheService.updateBucketsData("exampleBucket", createBucketCache(mockConnection, new Date(), new Date()));
            const infer = pendingInfer();

            const loading = cacheService.ensureCollectionSchema("exampleBucket", "exampleScope", "exampleCollection");
            await new Promise((resolve) => setImmediate(resolve));
            // A tree expand reloads the cache: every collection object is replaced
            cacheService.updateBucketsData("exampleBucket", createBucketCache(mockConnection, new Date(), new Date()));
            infer.release();
            const result = await loading;

            const live = await cacheService.getCollectionWithBucketAndScopeName("exampleBucket", "exampleScope", "exampleCollection");
            expect(live?.schema?.patterns).toEqual([{ orderId: { type: "string", value: "string" } }]);
            expect(result).toBe(live);
            expect(cacheService.storeCache).toHaveBeenCalled();
        });

        it("saves nothing when the user switches cluster while INFER runs", async () => {
            cacheService.updateBucketsData("exampleBucket", createBucketCache(mockConnection, new Date(), new Date()));
            const infer = pendingInfer();
            const clusterA = getActiveConnection();

            const loading = cacheService.ensureCollectionSchema("exampleBucket", "exampleScope", "exampleCollection");
            await new Promise((resolve) => setImmediate(resolve));
            getActiveConnection.mockReturnValue({ ...clusterA, connectionIdentifier: "clusterB" });
            try {
                infer.release();
                await loading;
            } finally {
                getActiveConnection.mockReturnValue(clusterA);
            }

            expect(cacheService.storeCache).not.toHaveBeenCalled();
            const cached = await cacheService.getCollectionWithBucketAndScopeName("exampleBucket", "exampleScope", "exampleCollection");
            expect(cached?.schema).toBeUndefined();
        });

        it("never saves one cluster's cache under another cluster's key", async () => {
            const { Global } = require("../util");
            const saved = new Map<string, any>();
            Global.setState({ get: (k: string) => saved.get(k), update: async (k: string, v: any) => { saved.set(k, v); }, keys: () => [] });
            (cacheService.storeCache as jest.Mock).mockRestore();
            const clusterB = { ...mockConnection, connectionIdentifier: "clusterB" };
            cacheService.updateBucketsData("bucketOfB", createBucketCache(clusterB, new Date(), new Date()));

            await cacheService.storeCache(mockConnection);
            expect(saved.has(`vscode-couchbase.iq.bucketsCache.${mockConnection.connectionIdentifier}`)).toBe(false);

            await cacheService.storeCache(clusterB);
            expect(saved.has("vscode-couchbase.iq.bucketsCache.clusterB")).toBe(true);
        });

        it("returns undefined for an unknown collection without querying", async () => {
            cacheService.updateBucketsData("exampleBucket", createBucketCache(mockConnection, new Date(), new Date()));

            expect(await cacheService.ensureCollectionSchema("exampleBucket", "exampleScope", "missing")).toBeUndefined();
            expect(query()).not.toHaveBeenCalled();
        });
    });
});