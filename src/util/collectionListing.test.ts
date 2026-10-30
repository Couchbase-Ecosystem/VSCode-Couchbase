import * as assert from "assert";
import { COLLECTION_PAGE_SIZE, getVisibleCollections } from "./collectionListing";

const names = (count: number): string[] => Array.from({ length: count }, (_, i) => `c${i}`);

describe("Collection listing", () => {
  test("shows only the first page of a large scope", () => {
    const result = getVisibleCollections(names(10000), new Set(), [], COLLECTION_PAGE_SIZE);
    assert.deepStrictEqual(result.paged, names(10));
    assert.deepStrictEqual(result.searched, []);
    assert.strictEqual(result.hasMore, true);
  });

  test("load more grows the page by the limit", () => {
    const result = getVisibleCollections(names(25), new Set(), [], 20);
    assert.strictEqual(result.paged.length, 20);
    assert.strictEqual(result.hasMore, true);

    const last = getVisibleCollections(names(25), new Set(), [], 30);
    assert.strictEqual(last.paged.length, 25);
    assert.strictEqual(last.hasMore, false);
  });

  test("no load more when everything fits", () => {
    const result = getVisibleCollections(names(10), new Set(), [], COLLECTION_PAGE_SIZE);
    assert.strictEqual(result.paged.length, 10);
    assert.strictEqual(result.hasMore, false);
  });

  test("favorites come first, in server order", () => {
    const result = getVisibleCollections(names(50), new Set(["c40", "c12"]), [], 3);
    assert.deepStrictEqual(result.paged, ["c12", "c40", "c0"]);
  });

  test("searched collections are listed separately and not repeated in the page", () => {
    const result = getVisibleCollections(names(50), new Set(), ["c30", "c1"], COLLECTION_PAGE_SIZE);
    assert.deepStrictEqual(result.searched, ["c30", "c1"]);
    assert.ok(!result.paged.includes("c1"));
    assert.strictEqual(result.paged.length, 9);
  });

  test("searched collections that no longer exist are dropped", () => {
    const result = getVisibleCollections(names(5), new Set(), ["deleted", "c2", "c2"], COLLECTION_PAGE_SIZE);
    assert.deepStrictEqual(result.searched, ["c2"]);
  });
});
