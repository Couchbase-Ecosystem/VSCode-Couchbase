import { abbreviateCount, extractDocumentInfo, getNonce, hasQueryService, hasSearchService } from "./common";

describe("abbreviateCount", () => {
    it("shows ? for unknown (negative) counts", () => {
        expect(abbreviateCount(-1)).toBe("?");
    });

    it("shows small counts as-is", () => {
        expect(abbreviateCount(0)).toBe("0");
        expect(abbreviateCount(999)).toBe("999");
    });

    it("abbreviates thousands, millions and billions", () => {
        expect(abbreviateCount(1000)).toBe("1.0k");
        expect(abbreviateCount(15250)).toBe("15.3k");
        expect(abbreviateCount(2500000)).toBe("2.5m");
        expect(abbreviateCount(3000000000)).toBe("3.0b");
    });
});

describe("extractDocumentInfo", () => {
    it("splits a document path into bucket, scope, collection and id", () => {
        expect(extractDocumentInfo("/travel-sample/inventory/Collections/airline/airline_10.json")).toEqual({
            bucket: "travel-sample",
            scope: "inventory",
            collection: "airline",
            name: "airline_10",
        });
    });

    it("keeps dots in the document id", () => {
        expect(extractDocumentInfo("/b/s/Collections/c/user.v2.json").name).toBe("user.v2");
    });
});

describe("service checks", () => {
    it("detects the query service", () => {
        expect(hasQueryService(["kv", "n1ql"])).toBe(true);
        expect(hasQueryService(["kv"])).toBe(false);
        expect(hasQueryService(undefined)).toBe(false);
    });

    it("detects the search service", () => {
        expect(hasSearchService(["kv", "fts"])).toBe(true);
        expect(hasSearchService(["kv", "n1ql"])).toBe(false);
        expect(hasSearchService(undefined)).toBe(false);
    });
});

describe("getNonce", () => {
    it("returns a 32 character alphanumeric value", () => {
        expect(getNonce()).toMatch(/^[A-Za-z0-9]{32}$/);
    });

    it("returns a different value each time", () => {
        expect(getNonce()).not.toBe(getNonce());
    });
});
