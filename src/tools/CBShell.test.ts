import * as vscode from "vscode";
import { IConnection } from "../types/IConnection";

const mockListeners: { changed?: (connection: IConnection) => Promise<void> } = {};
jest.mock("vscode", () => ({
    window: {
        createOutputChannel: () => ({ appendLine: jest.fn(), show: jest.fn() }),
        createTerminal: jest.fn(() => ({ sendText: jest.fn(), dispose: jest.fn() })),
        showInformationMessage: jest.fn(),
    },
}));
jest.mock("../util/events/connectionEvents", () => ({
    __esModule: true,
    default: {
        onConnectionChanged: (listener: any) => { mockListeners.changed = listener; },
        onConnectionRemoved: jest.fn(),
    },
}));
jest.mock("../util/connections", () => ({ getConnectionId: () => "id" }));
jest.mock("../util/secretService", () => ({ SecretService: { getInstance: () => ({ get: async () => "s3cret" }) } }));
jest.mock("../util/DependencyDownloaderUtils/CBTool", () => ({ CBTools: { getTool: () => ({ path: "/tools/cbsh" }) }, Type: {} }));

const certificateConnection = { url: "couchbases://localhost", username: "vscode-cert-user", connectionIdentifier: "c", isSecure: true, authType: "certificate" } as IConnection;
const passwordConnection = { url: "couchbase://localhost", username: "Administrator", connectionIdentifier: "p", isSecure: false } as IConnection;

describe("Couchbase Shell", () => {
    beforeAll(() => {
        const { CBShell } = require("./CBShell");
        CBShell.getInstance({ environmentVariableCollection: { replace: jest.fn() } });
    });
    beforeEach(() => jest.clearAllMocks());

    it("tells the user once that it is not available with certificate login, and opens no terminal", async () => {
        await mockListeners.changed!(certificateConnection);
        await mockListeners.changed!(certificateConnection);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(expect.stringContaining("certificate login"));
        expect(vscode.window.createTerminal).not.toHaveBeenCalled();
    });

    it("still opens for password connections", async () => {
        await mockListeners.changed!(passwordConnection);

        expect(vscode.window.createTerminal).toHaveBeenCalledWith({ name: "CBShell" });
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });
});
