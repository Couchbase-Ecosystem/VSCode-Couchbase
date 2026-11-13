import { buildMCPEnvironment } from "./mcpConfig";

jest.mock("vscode", () => ({
    window: { createOutputChannel: () => ({ appendLine: jest.fn(), show: jest.fn() }) },
    workspace: { getConfiguration: () => ({ get: jest.fn() }) },
}));

const base = {
    connectionString: "couchbases://localhost",
    username: "vscode-cert-user",
    password: "",
    config: {},
    defaultLogFilePath: "/tmp/mcp.log",
};

describe("buildMCPEnvironment", () => {
    it("passes username and password for password connections, as before", () => {
        const env = buildMCPEnvironment({ ...base, username: "Administrator", password: "secret" });
        expect(env).toEqual(expect.objectContaining({ CB_USERNAME: "Administrator", CB_PASSWORD: "secret" }));
        expect(env.CB_CLIENT_CERT_PATH).toBeUndefined();
    });

    it("passes the client certificate, and no password, for certificate connections", () => {
        const env = buildMCPEnvironment({
            ...base,
            certificate: { certificatePath: "/certs/client.pem", keyPath: "/certs/client.key", caPath: "/certs/ca.pem" },
        });
        expect(env).toEqual(expect.objectContaining({
            CB_CONNECTION_STRING: "couchbases://localhost",
            CB_CLIENT_CERT_PATH: "/certs/client.pem",
            CB_CLIENT_KEY_PATH: "/certs/client.key",
            CB_CA_CERT_PATH: "/certs/ca.pem",
        }));
        expect(env.CB_USERNAME).toBeUndefined();
        expect(env.CB_PASSWORD).toBeUndefined();
    });

    it("leaves out the CA when none is set", () => {
        const env = buildMCPEnvironment({ ...base, certificate: { certificatePath: "/c.pem", keyPath: "/k.pem" } });
        expect(env.CB_CA_CERT_PATH).toBeUndefined();
    });
});
