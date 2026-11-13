import { IQuery } from "../types/IQuery";
import { Constants } from "./constants";
import { deleteQuery, getQueryHistory, saveQuery } from "./queryHistory";
import { Global } from "./util";
import { fakeMemento } from "../testHelpers/fakeMemento";

const query = (id: string, text: string): IQuery => ({ id, query: text } as IQuery);

describe("query history", () => {
    beforeEach(() => {
        Global.setState(fakeMemento());
    });

    it("starts empty", () => {
        expect(getQueryHistory()).toBeUndefined();
    });

    it("adds the newest query first", async () => {
        await saveQuery(query("1", "SELECT 1"));
        await saveQuery(query("2", "SELECT 2"));
        expect(getQueryHistory()?.map((q) => q.id)).toEqual(["2", "1"]);
    });

    it("does not repeat the same query run twice in a row", async () => {
        await saveQuery(query("1", "SELECT 1"));
        await saveQuery(query("2", "SELECT 1"));
        expect(getQueryHistory()).toHaveLength(1);
    });

    it("keeps at most 100 queries, dropping the oldest", async () => {
        for (let i = 0; i < 105; i++) {
            await saveQuery(query(`${i}`, `SELECT ${i}`));
        }
        const history = getQueryHistory()!;
        expect(history).toHaveLength(100);
        expect(history[0].id).toBe("104");
        expect(history[99].id).toBe("5");
    });

    it("deletes a query by id", async () => {
        await saveQuery(query("1", "SELECT 1"));
        await saveQuery(query("2", "SELECT 2"));
        const remaining = await deleteQuery(query("1", "SELECT 1"));
        expect(remaining.map((q) => q.id)).toEqual(["2"]);
        expect(Global.state.get<IQuery[]>(Constants.QUERY_HISTORY)).toEqual(remaining);
    });

    it("deleting from an empty history returns an empty list", async () => {
        expect(await deleteQuery(query("1", "SELECT 1"))).toEqual([]);
    });
});
