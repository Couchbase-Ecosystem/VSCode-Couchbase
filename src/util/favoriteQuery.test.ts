import * as vscode from "vscode";
import { deleteFavoriteQuery, getFavoriteQueries, saveFavoriteQuery } from "./favoriteQuery";
import { Global } from "./util";
import { fakeMemento } from "../testHelpers/fakeMemento";

jest.mock("../pages/FavoriteQueries/FavoriteQueries", () => ({
    fetchFavoriteQueries: jest.fn(),
}));

const context = {} as vscode.ExtensionContext;

describe("favorite queries", () => {
    beforeEach(() => {
        Global.setState(fakeMemento());
        jest.clearAllMocks();
    });

    it("starts empty", () => {
        expect(getFavoriteQueries()).toEqual([]);
    });

    it("saves a query under a key", async () => {
        await saveFavoriteQuery({ key: "hotels", value: "SELECT * FROM hotel" });
        expect(getFavoriteQueries()).toEqual([{ key: "hotels", value: "SELECT * FROM hotel" }]);
    });

    it("refuses a duplicate key and keeps the original", async () => {
        await saveFavoriteQuery({ key: "hotels", value: "SELECT 1" });
        await saveFavoriteQuery({ key: "hotels", value: "SELECT 2" });
        expect(getFavoriteQueries()).toEqual([{ key: "hotels", value: "SELECT 1" }]);
        expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it("deletes a query by key", async () => {
        await saveFavoriteQuery({ key: "a", value: "SELECT 1" });
        await saveFavoriteQuery({ key: "b", value: "SELECT 2" });
        await deleteFavoriteQuery("a", context);
        expect(getFavoriteQueries()).toEqual([{ key: "b", value: "SELECT 2" }]);
    });

    it("reports an error when deleting a key that does not exist", async () => {
        await saveFavoriteQuery({ key: "a", value: "SELECT 1" });
        await deleteFavoriteQuery("missing", context);
        expect(getFavoriteQueries()).toHaveLength(1);
        expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
});
