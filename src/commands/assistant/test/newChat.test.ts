import { newChatHandler } from "../newChatHandler";
import { Memory } from "../../../util/util";
import { Constants } from "../../../util/constants";

jest.mock("vscode", () => require("./vscodeMock"));

describe("New Chat button", () => {
    beforeEach(() => Memory.setState());

    it("tells the Assistant chat to start a new conversation", () => {
        const postMessage = jest.fn();
        Memory.state.update(Constants.IQ_WEBVIEW, { webview: { postMessage } });

        newChatHandler();

        expect(postMessage).toHaveBeenCalledWith({ command: "vscode-couchbase.iq.sendNewChatRequest" });
    });

    it("does nothing before the Assistant panel has opened", () => {
        expect(() => newChatHandler()).not.toThrow();
    });
});
