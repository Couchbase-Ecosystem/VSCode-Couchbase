import { removeLegacyIqData } from "./removeLegacyIqData";
import { Constants } from "./constants";

jest.mock("vscode", () => require("../commands/assistant/test/vscodeMock"));

const fakeGlobalState = (initial: Record<string, any>) => {
    const store = new Map(Object.entries(initial));
    return {
        store,
        get: (key: string) => store.get(key),
        update: jest.fn(async (key: string, value: any) => {
            if (value === undefined) {
                store.delete(key);
            } else {
                store.set(key, value);
            }
        }),
        keys: () => [...store.keys()],
    };
};

const fakeSecrets = () => ({ delete: jest.fn(async () => undefined) });

describe("removeLegacyIqData", () => {
    it("deletes the saved iQ password and username", async () => {
        const state = fakeGlobalState({ [Constants.IQ_USER_ID]: "dev@example.com" });
        const secrets = fakeSecrets();

        await removeLegacyIqData(state as any, secrets as any);

        expect(secrets.delete).toHaveBeenCalledWith("iqPassword-dev@example.com");
        expect(state.store.has(Constants.IQ_USER_ID)).toBe(false);
    });

    it("deletes saved iQ chat history", async () => {
        const state = fakeGlobalState({
            "vscode-couchbase.iq.allMessages.org-1": [{ chatId: "a" }],
            "vscode-couchbase.iq.allMessages.org-2": [{ chatId: "b" }],
        });

        await removeLegacyIqData(state as any, fakeSecrets() as any);

        expect(state.keys()).toEqual([]);
    });

    it("keeps everything the Assistant and the rest of the extension use", async () => {
        const kept = {
            [Constants.ASSISTANT_HAS_BEEN_SHOWN_WELCOME_MESSAGE]: true,
            "vscode-couchbase.iq.bucketsCache.my-connection": "{}",
            [Constants.QUERY_HISTORY]: [],
            [Constants.connectionKeys]: {},
        };
        const state = fakeGlobalState({ ...kept, [Constants.IQ_USER_ID]: "dev@example.com" });

        await removeLegacyIqData(state as any, fakeSecrets() as any);

        expect(Object.fromEntries(state.store)).toEqual(kept);
    });

    it("does nothing when iQ was never used", async () => {
        const state = fakeGlobalState({});
        const secrets = fakeSecrets();

        await removeLegacyIqData(state as any, secrets as any);

        expect(secrets.delete).not.toHaveBeenCalled();
        expect(state.update).not.toHaveBeenCalled();
    });

    it("still clears chat history when deleting the saved password fails, and keeps the username to retry", async () => {
        const state = fakeGlobalState({
            [Constants.IQ_USER_ID]: "dev@example.com",
            "vscode-couchbase.iq.allMessages.org-1": [{ chatId: "a" }],
        });
        const secrets = { delete: jest.fn(async () => { throw new Error("keychain locked"); }) };

        await removeLegacyIqData(state as any, secrets as any);

        expect(state.store.has("vscode-couchbase.iq.allMessages.org-1")).toBe(false);
        expect(state.store.get(Constants.IQ_USER_ID)).toBe("dev@example.com");
    });

    it("never fails extension start-up if storage errors", async () => {
        const state = fakeGlobalState({ [Constants.IQ_USER_ID]: "dev@example.com" });
        const secrets = { delete: jest.fn(async () => { throw new Error("keychain locked"); }) };

        await expect(removeLegacyIqData(state as any, secrets as any)).resolves.toBeUndefined();
    });
});
