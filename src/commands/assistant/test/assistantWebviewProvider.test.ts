import * as crypto from "crypto";
import * as path from "path";
import * as vscode from "vscode";
import { CouchbaseAssistantWebviewProvider } from "../assistantWebviewProvider";
import { assistantChat, ensureTermsAccepted } from "../chat/chat";
import { AssistantRestAPI } from "../assistantRestAPI";
import { applyQuery } from "../../queryHistory/applyQuery";
import { Memory } from "../../../util/util";
import { Constants } from "../../../util/constants";

jest.mock("vscode", () => require("./vscodeMock"));
jest.mock("../chat/chat", () => ({
    assistantChat: jest.fn(),
    ensureTermsAccepted: jest.fn(),
}));
jest.mock("../assistantRestAPI", () => ({
    AssistantRestAPI: { sendFeedback: jest.fn() },
}));
jest.mock("../../queryHistory/applyQuery", () => ({ applyQuery: jest.fn() }));

const mockedChat = assistantChat as jest.Mock;
const mockedTerms = ensureTermsAccepted as jest.Mock;

// A fake webview view that records what the provider does with it
const fakeView = () => {
    let onMessage: (message: any) => Promise<void> = async () => {};
    const view = {
        webview: {
            options: {},
            html: "",
            asWebviewUri: jest.fn((uri: any) => ({ toString: () => `webview:${uri.fsPath}` })),
            postMessage: jest.fn(),
            onDidReceiveMessage: jest.fn((handler) => { onMessage = handler; }),
        },
    };
    return { view, send: (message: any) => onMessage(message) };
};

const setup = () => {
    const provider = new CouchbaseAssistantWebviewProvider({ extensionPath: "/ext" } as any, {} as any);
    const { view, send } = fakeView();
    provider.resolveWebviewView(view as any);
    return { provider, view, send };
};

describe("Assistant webview", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Memory.setState();
    });

    it("loads the Assistant React bundle from dist/assistant", () => {
        const { view } = setup();
        // path.join so the expected separator matches the OS the tests run on (\ on Windows)
        expect(view.webview.html).toContain(`src="webview:${path.join("/ext", "dist", "assistant", "reactBuild.js")}"`);
        expect(view.webview.options).toEqual(expect.objectContaining({ enableScripts: true }));
    });

    it("renders the root element the React app mounts on", () => {
        const { view } = setup();
        expect(view.webview.html).toContain('<div id="vscodeRootIQ">');
        expect(view.webview.html).toContain("const tsvscode = acquireVsCodeApi();");
    });

    it("uses a fresh script nonce in the content security policy", () => {
        const { view } = setup();
        const nonce = view.webview.html.match(/'nonce-([A-Za-z0-9]{32})'/)?.[1];
        expect(nonce).toBeDefined();
        expect(view.webview.html).toContain(`<script nonce="${nonce}" src=`);
    });

    it("stores the view so the New Chat button can reach it", () => {
        const { view } = setup();
        expect(Memory.state.get(Constants.IQ_WEBVIEW)).toBe(view);
    });

    it("replies with the Assistant's answer", async () => {
        mockedTerms.mockResolvedValue(true);
        mockedChat.mockResolvedValue({ content: "Use CREATE INDEX", runId: "run-1" });
        const { view, send } = setup();

        await send({ command: "vscode-couchbase.assistant.askAssistant", value: { newMessage: "hi" } });

        expect(mockedChat).toHaveBeenCalledWith({ newMessage: "hi" }, [], expect.anything());
        expect(view.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
            command: "vscode-couchbase.assistant.reply",
            message: "Use CREATE INDEX",
            runId: "run-1",
            isDarkTheme: true,
        }));
    });

    it("does not call the Assistant until the terms are accepted", async () => {
        mockedTerms.mockResolvedValue(false);
        const { view, send } = setup();

        await send({ command: "vscode-couchbase.assistant.askAssistant", value: { newMessage: "hi" } });

        expect(mockedChat).not.toHaveBeenCalled();
        expect(view.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
            command: "vscode-couchbase.assistant.chatCompleted",
            error: expect.stringContaining("accept the terms"),
        }));
    });

    it("passes Assistant errors back to the chat", async () => {
        mockedTerms.mockResolvedValue(true);
        mockedChat.mockResolvedValue({ error: "Service unavailable" });
        const { view, send } = setup();

        await send({ command: "vscode-couchbase.assistant.askAssistant", value: { newMessage: "hi" } });

        expect(view.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({
            command: "vscode-couchbase.assistant.chatCompleted",
            error: "Service unavailable",
        }));
    });

    it("sends 👍/👎 feedback with a hashed machine id, never the raw one", async () => {
        const { send } = setup();
        const messageBody = JSON.stringify({ data: { thread_id: "t1", rating: "up" } });

        await send({ command: "vscode-couchbase.assistant.sendFeedback", value: { messageBody, updatedMessages: [] } });

        const sent = JSON.parse((AssistantRestAPI.sendFeedback as jest.Mock).mock.calls[0][0]);
        expect(sent.data.user_id).toBe(crypto.createHash("sha256").update("test-machine-id").digest("hex"));
        expect(sent.data.rating).toBe("up");
    });

    it("sends a suggested query to the workbench", async () => {
        const { send } = setup();
        await send({ command: "vscode-couchbase.iq.applyQuery", value: "SELECT 1" });
        expect(applyQuery).toHaveBeenCalledWith(expect.objectContaining({ query: "SELECT 1" }));
    });

    it("runs action buttons and opens links", async () => {
        const { send } = setup();
        await send({ command: "vscode-couchbase.iq.executeActionCommand", value: "vscode-couchbase.createClusterConnection" });
        await send({ command: "vscode-couchbase.iq.openLinkInBrowser", value: "https://docs.couchbase.com" });
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith("vscode-couchbase.createClusterConnection");
        expect(vscode.env.openExternal).toHaveBeenCalled();
    });

    it("shows or hides the New Chat button when the chat asks", async () => {
        const { send } = setup();
        await send({ command: "vscode-couchbase.iq.showNewChatButton", value: { enabled: true } });
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith("setContext", "isIqNewChatButtonBVisible", true);
    });
});
