// How each Couchbase command-line tool is started for certificate and password connections
import * as vscode from "vscode";
import { IConnection } from "../types/IConnection";
import { getActiveConnection } from "../util/connections";
import { CBImport, ICBImportData } from "./CBImport";
import { CBExport } from "./CBExport";
import { MDBToCB } from "./MDBMigrate";
import { DynamoDBToCb } from "./DynamoDBMigrate";

const mockSentText: string[] = [];
const mockEnv = { replace: jest.fn() };
jest.mock("vscode", () => ({
    window: {
        createOutputChannel: () => ({ appendLine: jest.fn(), show: jest.fn() }),
        createTerminal: jest.fn(() => ({ sendText: (text: string) => mockSentText.push(text), show: jest.fn() })),
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn(),
    },
}));
jest.mock("../util/connections", () => ({
    getActiveConnection: jest.fn(),
    getConnectionId: jest.fn(() => "Administrator@couchbase://localhost"),
}));
jest.mock("../util/secretService", () => ({
    SecretService: { getInstance: () => ({ get: async () => "s3cret" }) },
}));
jest.mock("../util/DependencyDownloaderUtils/CBTool", () => ({
    CBTools: { getTool: () => ({ path: "/tools/bin" }) },
    Type: {},
}));

const certificateConnection: IConnection = {
    url: "couchbases://localhost",
    username: "vscode-cert-user",
    connectionIdentifier: "local-cert",
    isSecure: true,
    authType: "certificate",
    certificatePath: "/Users/me/Application Support/certs/client.pem",
    keyPath: "/Users/me/Application Support/certs/client.key",
    caPath: "/Users/me/certs/ca.pem",
};
const passwordConnection: IConnection = {
    url: "couchbase://localhost",
    username: "Administrator",
    connectionIdentifier: "local",
    isSecure: false,
};
const context = { environmentVariableCollection: mockEnv } as unknown as vscode.ExtensionContext;

const certificateArgs = (certFlag: string, keyFlag: string) =>
    `${certFlag} "/Users/me/Application Support/certs/client.pem" ${keyFlag} "/Users/me/Application Support/certs/client.key"`;

const useConnection = (connection: IConnection) => (getActiveConnection as jest.Mock).mockReturnValue(connection);

beforeEach(() => {
    jest.useFakeTimers();
    mockSentText.length = 0;
    jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

// The tools wait 5 seconds before clearing the password from the environment
const run = async (promise: Promise<void>) => {
    await jest.advanceTimersByTimeAsync(6000);
    await promise;
};

const importData: ICBImportData = {
    bucket: "test", dataset: "/data/in.json", fileFormat: "json", scopeCollectionExpression: "demo_shop.orders",
    generateKeyExpression: "#UUID#", skipDocsOrRows: undefined, limitDocsOrRows: undefined, ignoreFields: undefined,
    threads: 2, verbose: false, format: "lines",
};

describe("Data Import (cbimport)", () => {
    it("verifies the cluster with the connection's CA instead of skipping verification", async () => {
        useConnection(certificateConnection);
        await run(CBImport.import(importData, context));

        expect(mockSentText[0]).toContain('--cacert "/Users/me/certs/ca.pem"');
        expect(mockSentText[0]).not.toContain("--no-ssl-verify");
    });

    it("skips verification only when the certificate connection has no CA", async () => {
        useConnection({ ...certificateConnection, caPath: undefined });
        await run(CBImport.import(importData, context));

        expect(mockSentText[0]).toContain("--no-ssl-verify");
        expect(mockSentText[0]).not.toContain("--cacert");
    });

    it("logs in with the client certificate and never sets a password", async () => {
        useConnection(certificateConnection);
        await run(CBImport.import(importData, context));

        expect(mockSentText[0]).toContain(certificateArgs("--client-cert", "--client-key"));
        expect(mockSentText[0]).not.toMatch(/ -u /);
        expect(mockEnv.replace).not.toHaveBeenCalled();
    });

    it("keeps using the username and password for password connections", async () => {
        useConnection(passwordConnection);
        await run(CBImport.import(importData, context));

        expect(mockSentText[0]).toContain("-u Administrator");
        expect(mockSentText[0]).toContain("--no-ssl-verify");
        expect(mockSentText[0]).not.toContain("--client-cert");
        expect(mockEnv.replace).toHaveBeenCalledWith("CB_PASSWORD", "s3cret");
    });
});

describe("Data Export (cbexport)", () => {
    const exportAll = () => CBExport.export("test", ["All Scopes"], [], "/out", "key", "scope", "collection", "lines", "2", false, context);

    it("verifies the cluster with the connection's CA instead of skipping verification", async () => {
        useConnection(certificateConnection);
        await run(exportAll());

        expect(mockSentText[0]).toContain('--cacert "/Users/me/certs/ca.pem"');
        expect(mockSentText[0]).not.toContain("--no-ssl-verify");
    });

    it("skips verification only when the certificate connection has no CA", async () => {
        useConnection({ ...certificateConnection, caPath: undefined });
        await run(exportAll());

        expect(mockSentText[0]).toContain("--no-ssl-verify");
        expect(mockSentText[0]).not.toContain("--cacert");
    });

    it("logs in with the client certificate and never sets a password", async () => {
        useConnection(certificateConnection);
        await run(exportAll());

        expect(mockSentText[0]).toContain(certificateArgs("--client-cert", "--client-key"));
        expect(mockSentText[0]).not.toMatch(/ -u /);
        expect(mockEnv.replace).not.toHaveBeenCalled();
    });

    it("keeps using the username and password for password connections", async () => {
        useConnection(passwordConnection);
        await run(exportAll());

        expect(mockSentText[0]).toContain("-u Administrator");
        expect(mockSentText[0]).toContain("--no-ssl-verify");
        expect(mockEnv.replace).toHaveBeenCalledWith("CB_PASSWORD", "s3cret");
    });
});

describe("MongoDB migration (cbmigrate mongo)", () => {
    const migrate = () => MDBToCB.export("mongodb://localhost", "shop", ["orders"], "", "test", "demo_shop");

    it("logs in with the client certificate and trusts the connection's CA", async () => {
        useConnection(certificateConnection);
        await migrate();

        expect(mockSentText[0]).toContain(certificateArgs("--cb-client-cert", "--cb-client-key"));
        expect(mockSentText[0]).toContain('--cb-cacert "/Users/me/certs/ca.pem"');
        expect(mockSentText[0]).not.toContain("--cb-username");
        expect(mockSentText[0]).not.toContain("--cb-password");
    });

    it("leaves out the CA option when the connection has no CA file", async () => {
        useConnection({ ...certificateConnection, caPath: undefined });
        await migrate();

        expect(mockSentText[0]).not.toContain("--cb-cacert");
    });

    it("keeps using the username and password for password connections", async () => {
        useConnection(passwordConnection);
        await migrate();

        expect(mockSentText[0]).toContain("--cb-username Administrator --cb-password 's3cret'");
        expect(mockSentText[0]).not.toContain("--cb-client-cert");
    });
});

describe("DynamoDB migration (cbmigrate dynamodb)", () => {
    const migrate = (noSslVerify: boolean) =>
        DynamoDBToCb.export(true, "default", "us-east-1", ["orders"], "", "", "test", "demo_shop", "", false, noSslVerify);

    it("logs in with the client certificate and trusts the connection's CA", async () => {
        useConnection(certificateConnection);
        await migrate(false);

        expect(mockSentText[0]).toContain(certificateArgs("--cb-client-cert", "--cb-client-key"));
        expect(mockSentText[0]).toContain('--cb-cacert "/Users/me/certs/ca.pem"');
        expect(mockSentText[0]).not.toContain("--cb-username");
        expect(mockSentText[0]).not.toContain("--cb-password");
    });

    it("passes only --cb-no-ssl-verify when the user chose it (cbmigrate would drop the CA otherwise)", async () => {
        useConnection(certificateConnection);
        await migrate(true);

        expect(mockSentText[0]).toContain("--cb-no-ssl-verify");
        expect(mockSentText[0]).not.toContain("--cb-cacert");
    });

    it("keeps using the username and password for password connections", async () => {
        useConnection(passwordConnection);
        await migrate(false);

        expect(mockSentText[0]).toContain("--cb-username Administrator");
        expect(mockSentText[0]).toContain("--cb-password 's3cret'");
        expect(mockSentText[0]).not.toContain("--cb-client-cert");
    });
});
