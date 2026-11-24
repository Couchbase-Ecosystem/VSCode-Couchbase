import * as assert from "assert";
import { Memory } from "./util";
import {
  clearDocumentFilter,
  getDocumentFilter,
  setKvDocumentFilter,
  setQueryDocumentFilter,
} from "./documentFilter";

jest.mock("vscode", () => ({}), { virtual: true });

const conn = "conn1";
const airline = { bucketName: "travel-sample", scopeName: "inventory", collectionName: "airline" };
const hotel = { ...airline, collectionName: "hotel" };

describe("Document filter state", () => {
  beforeEach(() => Memory.setState());

  test("no filter by default", () => {
    assert.deepStrictEqual(getDocumentFilter(conn, airline), {
      type: "",
      queryFilter: "",
      kvStartDocId: "",
      kvEndDocId: "",
    });
  });

  test("query filter is trimmed and replaces a kv filter", () => {
    setKvDocumentFilter(conn, airline, "a", "z");
    setQueryDocumentFilter(conn, airline, '  country="France"  ');
    assert.deepStrictEqual(getDocumentFilter(conn, airline), {
      type: "query",
      queryFilter: 'country="France"',
      kvStartDocId: "",
      kvEndDocId: "",
    });
  });

  test("kv filter keeps open-ended ranges and replaces a query filter", () => {
    setQueryDocumentFilter(conn, airline, 'country="France"');
    setKvDocumentFilter(conn, airline, "airline_10", "");
    assert.deepStrictEqual(getDocumentFilter(conn, airline), {
      type: "kv",
      queryFilter: "",
      kvStartDocId: "airline_10",
      kvEndDocId: "",
    });
  });

  test("filters are scoped to connection and collection", () => {
    setQueryDocumentFilter(conn, airline, "x=1");
    assert.strictEqual(getDocumentFilter(conn, hotel).type, "");
    assert.strictEqual(getDocumentFilter("conn2", airline).type, "");
  });

  test("clear removes the filter", () => {
    setKvDocumentFilter(conn, airline, "a", "b");
    clearDocumentFilter(conn, airline);
    assert.strictEqual(getDocumentFilter(conn, airline).type, "");
  });

  test("keeps the existing session storage keys", () => {
    setQueryDocumentFilter(conn, airline, "x=1");
    assert.strictEqual(Memory.state.get("filterDocumentsType-conn1-travel-sample-inventory-airline"), "query");
    assert.strictEqual(Memory.state.get("queryTypeFilterDocuments-conn1-travel-sample-inventory-airline"), "x=1");
    setKvDocumentFilter(conn, airline, "a", "b");
    assert.strictEqual(Memory.state.get("kvTypeFilterDocuments-conn1-travel-sample-inventory-airline"), "a|b");
  });
});
