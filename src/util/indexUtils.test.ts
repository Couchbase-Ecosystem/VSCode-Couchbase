import { QueryIndex } from "couchbase";
import { getIndexDefinition } from "./indexUtils";

const index = (overrides: Partial<QueryIndex>): QueryIndex => ({
    name: "idx",
    isPrimary: false,
    type: "gsi",
    state: "online",
    keyspace: "travel-sample",
    namespace: "default",
    indexKey: [],
    bucketName: "travel-sample",
    ...overrides,
} as unknown as QueryIndex);

describe("getIndexDefinition", () => {
    it("builds a primary index on a bucket", () => {
        expect(getIndexDefinition(index({ name: "#primary", isPrimary: true }))).toBe(
            "CREATE PRIMARY INDEX `#primary` ON `travel-sample`"
        );
    });

    it("builds a secondary index on a collection with keys", () => {
        expect(getIndexDefinition(index({
            name: "idx_city",
            scopeName: "inventory",
            collectionName: "hotel",
            indexKey: ["`city`", "`country`"],
        }))).toBe("CREATE INDEX `idx_city` ON `travel-sample`.`inventory`.`hotel`(`city`, `country`)");
    });

    it("adds WHERE and PARTITION BY clauses", () => {
        expect(getIndexDefinition(index({
            indexKey: ["`type`"],
            condition: "(`type` = \"hotel\")",
            partition: "HASH(meta().id)",
        }))).toBe("CREATE INDEX `idx` ON `travel-sample`(`type`) WHERE (`type` = \"hotel\") PARTITION BY HASH(meta().id)");
    });

    it("ignores the scope when there is no collection", () => {
        expect(getIndexDefinition(index({ scopeName: "inventory" }))).toBe("CREATE INDEX `idx` ON `travel-sample`");
    });
});
