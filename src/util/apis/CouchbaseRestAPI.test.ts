import axios from "axios";
import { IConnection } from "../../types/IConnection";
import { CouchbaseRestAPI } from "./CouchbaseRestAPI";

jest.mock("axios");
jest.mock("./NSLookup", () => ({
    getServerURL: jest.fn(async () => ["node1.example.com"]),
    getFTSNodes: jest.fn(() => []),
}));
jest.mock("../connections", () => ({
    getConnectionId: jest.fn(() => "Administrator@couchbase://node1.example.com"),
}));

const mockSecretGet = jest.fn();
jest.mock("../secretService", () => ({
    SecretService: { getInstance: () => ({ get: mockSecretGet }) },
}));

const mockedPost = axios.post as jest.Mock;

const connection = (isSecure: boolean): IConnection => ({
    url: "couchbase://node1.example.com",
    username: "Administrator",
    isSecure,
} as IConnection);

const statsResponse = (counts: Record<string, string>) => ({
    data: [{
        data: Object.entries(counts).map(([collection, value]) => ({
            metric: { name: "kv_collection_item_count", collection },
            values: [[1700000000, value]],
        })),
    }],
});

describe("CouchbaseRestAPI.getKVDocumentCount", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSecretGet.mockResolvedValue("password");
    });

    it("maps the stats response to a count per collection", async () => {
        mockedPost.mockResolvedValue(statsResponse({ airline: "187", hotel: "917" }));

        const counts = await new CouchbaseRestAPI(connection(false)).getKVDocumentCount("travel-sample", "inventory");

        expect(counts.get("kv_collection_item_count-travel-sample-inventory-airline")).toBe(187);
        expect(counts.get("kv_collection_item_count-travel-sample-inventory-hotel")).toBe(917);
        expect(counts.size).toBe(2);
    });

    it("asks for the right bucket and scope", async () => {
        mockedPost.mockResolvedValue(statsResponse({}));

        await new CouchbaseRestAPI(connection(false)).getKVDocumentCount("travel-sample", "inventory");

        const [url, payload] = mockedPost.mock.calls[0];
        expect(url).toBe("http://node1.example.com:8091/pools/default/stats/range/");
        expect(JSON.parse(payload)[0].metric).toEqual(expect.arrayContaining([
            { label: "bucket", value: "travel-sample" },
            { label: "scope", value: "inventory" },
        ]));
    });

    it("uses the TLS port for secure connections", async () => {
        mockedPost.mockResolvedValue(statsResponse({}));

        await new CouchbaseRestAPI(connection(true)).getKVDocumentCount("b", "s");

        expect(mockedPost.mock.calls[0][0]).toBe("https://node1.example.com:18091/pools/default/stats/range/");
    });

    it("sends basic auth with the stored password", async () => {
        mockedPost.mockResolvedValue(statsResponse({}));

        await new CouchbaseRestAPI(connection(false)).getKVDocumentCount("b", "s");

        const expected = `Basic ${Buffer.from("Administrator:password").toString("base64")}`;
        expect(mockedPost.mock.calls[0][2].headers.Authorization).toBe(expected);
    });

    it("returns no counts without calling the cluster when no password is stored", async () => {
        mockSecretGet.mockResolvedValue(undefined);

        const counts = await new CouchbaseRestAPI(connection(false)).getKVDocumentCount("b", "s");

        expect(counts.size).toBe(0);
        expect(mockedPost).not.toHaveBeenCalled();
    });
});
