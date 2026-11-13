import * as fs from "fs";
import * as path from "path";
import CollectionNode from "./CollectionNode";
import { PagerNode } from "./PagerNode";
import InformationNode from "./InformationNode";
import DocumentNode from "./DocumentNode";
import { Memory } from "../util/util";
import { getActiveConnection } from "../util/connections";

// Keep the native SDK out of unit tests; only the error classes are needed here
jest.mock("couchbase", () => ({
    PlanningFailureError: class PlanningFailureError extends Error {},
    ParsingFailureError: class ParsingFailureError extends Error {},
}));
jest.mock("../util/connections", () => ({
    getActiveConnection: jest.fn(),
}));
const mockGetKVDocuments = jest.fn();
jest.mock("../util/apis/CouchbaseRestAPI", () => ({
    CouchbaseRestAPI: jest.fn().mockImplementation(() => ({ getKVDocuments: mockGetKVDocuments })),
}));

const mockedGetActiveConnection = getActiveConnection as jest.Mock;
const cacheService = { refreshCacheOnTimeout: jest.fn() } as any;

const setConnection = (services: string[], cluster: any = {}) =>
    mockedGetActiveConnection.mockReturnValue({ connectionIdentifier: "conn", services, cluster });

const node = (collectionName = "hotel", documentCount = 25, limit = 10) =>
    new CollectionNode({} as any, "inventory", documentCount, "travel-sample", collectionName, 0, cacheService, limit);

const setFilter = (collectionName: string, type: "kv" | "query") =>
    Memory.state.update(`filterDocumentsType-conn-travel-sample-inventory-${collectionName}`, type);

describe("CollectionNode tree item", () => {
    beforeEach(() => {
        Memory.setState();
        setConnection(["kv", "n1ql"]);
    });

    it("shows the name with an abbreviated document count", async () => {
        expect((await node("hotel", 15250).getTreeItem()).label).toBe("hotel (15.3k)");
    });

    const cases: [string, "kv" | "query" | undefined, string][] = [
        ["hotel", undefined, "collection"],
        ["_default", undefined, "default_collection"],
        ["hotel", "kv", "collection_filter_kv"],
        ["hotel", "query", "collection_filter_query"],
        ["_default", "kv", "default_collection_filter_kv"],
    ];
    for (const [name, filter, expected] of cases) {
        it(`${name} with filter ${filter ?? "none"} has context value ${expected}`, async () => {
            if (filter) {
                await setFilter(name, filter);
            }
            expect((await node(name).getTreeItem()).contextValue).toBe(expected);
        });
    }
});

describe("CollectionNode context values match the right-click menus", () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf8"));
    const menuItem = (command: string) =>
        pkg.contributes.menus["view/item/context"].find((item: any) => item.command === command);
    // Accepts both the exact form (viewItem == x) and the regex form (viewItem =~ /^x$/)
    const offeredFor = (command: string, contextValue: string) => {
        const when: string = menuItem(command).when;
        if (when.includes(`viewItem == ${contextValue})`) || when.includes(`viewItem == ${contextValue} `)) {
            return true;
        }
        return [...when.matchAll(/viewItem =~ \/(.+?)\//g)].some((m) => new RegExp(m[1]).test(contextValue));
    };

    const allCollectionContexts = [
        "collection", "default_collection",
        "collection_filter_kv", "collection_filter_query",
        "default_collection_filter_kv", "default_collection_filter_query",
    ];

    for (const command of ["vscode-couchbase.createDocument", "vscode-couchbase.searchDocument", "vscode-couchbase.refreshCollection"]) {
        it(`${command} is offered on every kind of collection`, () => {
            expect(allCollectionContexts.filter((ctx) => !offeredFor(command, ctx))).toEqual([]);
        });
    }

    it("Remove Collection is not offered on the _default collection", () => {
        expect(offeredFor("vscode-couchbase.removeCollection", "collection")).toBe(true);
        expect(offeredFor("vscode-couchbase.removeCollection", "default_collection")).toBe(false);
    });
});

describe("CollectionNode.getIndexedField", () => {
    const withIndexes = (indexes: any[]) =>
        setConnection(["kv", "n1ql"], { queryIndexes: () => ({ getAllIndexes: async () => indexes }) });

    beforeEach(() => Memory.setState());

    it("uses meta().id when there is a primary index", async () => {
        withIndexes([{ isPrimary: true, indexKey: [] }]);
        expect(await node().getIndexedField()).toBe("meta().id");
    });

    it("uses the leading key of a secondary index, without backticks or sort order", async () => {
        withIndexes([{ isPrimary: false, indexKey: ["`city` DESC", "`name`"] }]);
        expect(await node().getIndexedField()).toBe("city");
    });

    it("skips function keys", async () => {
        withIndexes([{ isPrimary: false, indexKey: ["lower(`name`)", "`country`"] }]);
        expect(await node().getIndexedField()).toBe("country");
    });

    it("returns null when there are no usable indexes", async () => {
        withIndexes([]);
        expect(await node().getIndexedField()).toBeNull();
    });
});

describe("CollectionNode children (documents)", () => {
    const ids = (count: number) => Array.from({ length: count }, (_, i) => `doc_${i}`);

    beforeEach(() => {
        Memory.setState();
        jest.clearAllMocks();
    });

    it("with the query service: lists Indexes, Schema, the first page of documents and Load more", async () => {
        const query = jest.fn().mockResolvedValue({ rows: ids(10) });
        setConnection(["kv", "n1ql"], {
            query,
            queryIndexes: () => ({ getAllIndexes: async () => [{ isPrimary: true, indexKey: [] }] }),
        });

        const children = await node("hotel", 25, 10).getChildren();

        expect(children).toHaveLength(2 + 10 + 1);
        expect(children.filter((c) => c instanceof DocumentNode)).toHaveLength(10);
        expect(children[children.length - 1]).toBeInstanceOf(PagerNode);
        expect(query.mock.calls[0][0]).toContain("LIMIT 10");
    });

    it("hides Load more once every document is shown", async () => {
        setConnection(["kv", "n1ql"], {
            query: jest.fn().mockResolvedValue({ rows: ids(25) }),
            queryIndexes: () => ({ getAllIndexes: async () => [{ isPrimary: true, indexKey: [] }] }),
        });

        const children = await node("hotel", 25, 30).getChildren();

        expect(children.some((c) => c instanceof PagerNode)).toBe(false);
    });

    it("without the query service: reads documents over KV", async () => {
        setConnection(["kv"]);
        mockGetKVDocuments.mockResolvedValue({ rows: ids(10).map((id) => ({ id })) });

        const children = await node("hotel", 25, 10).getChildren();

        expect(mockGetKVDocuments).toHaveBeenCalledWith("travel-sample", "inventory", "hotel", 0, 10, undefined, undefined);
        expect(children.filter((c) => c instanceof DocumentNode)).toHaveLength(10);
        expect(children[children.length - 1]).toBeInstanceOf(PagerNode);
    });

    it("shows a message for an empty collection", async () => {
        setConnection(["kv"]);
        mockGetKVDocuments.mockResolvedValue({ rows: [] });

        const children = await node("hotel", 0, 10).getChildren();

        expect(children).toHaveLength(1);
        expect(children[0]).toBeInstanceOf(InformationNode);
    });
});
