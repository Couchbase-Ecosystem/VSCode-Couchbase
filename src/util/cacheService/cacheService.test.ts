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
function createBucketCache(mockConnection: IConnection, bucketTimeStamp: Date, collectionTimeStamp: Date) {
    const exampleCollectionCache: ICollectionCache = {
        name: "exampleCollection",
        scopeName: "exampleScope",
        bucketName: "exampleBucket",
        indexes: ["index1", "index2"],
        timeStamp: collectionTimeStamp,
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

        const exampleBucketCache = createBucketCache(mockConnection, currentTime, tenMinutesAgo);

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
});