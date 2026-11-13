import * as path from "path";
import { IConnection } from "../types/IConnection";
import {
    getCliCertificateArgs,
    getCertificateUsername,
    getConnectOptions,
    getRestAuth,
    isCertificateAuth,
    validateCertificateFiles,
} from "./connectionAuth";

// Keep the native SDK out of unit tests; only the authenticator class is needed
jest.mock("couchbase", () => ({
    CertificateAuthenticator: class CertificateAuthenticator {
        constructor(public certificatePath: string, public keyPath: string) {}
    },
}));

const fixture = (name: string) => path.join(__dirname, "testFixtures", name);
const certificatePath = fixture("client-cert.pem");
const keyPath = fixture("fake-client.key");

const passwordConnection: IConnection = {
    url: "couchbase://localhost",
    username: "Administrator",
    connectionIdentifier: "local",
    isSecure: false,
};

const certificateConnection: IConnection = {
    url: "couchbases://localhost",
    username: "vscode-cert-user",
    connectionIdentifier: "local-cert",
    isSecure: true,
    authType: "certificate",
    certificatePath,
    keyPath,
};

describe("isCertificateAuth", () => {
    it("treats connections saved before certificate login as password connections", () => {
        expect(isCertificateAuth(passwordConnection)).toBe(false);
        expect(isCertificateAuth({ authType: "password" })).toBe(false);
        expect(isCertificateAuth(certificateConnection)).toBe(true);
    });
});

describe("getConnectOptions", () => {
    it("uses username and password for password connections, as before", () => {
        expect(getConnectOptions(passwordConnection, "secret")).toEqual({
            username: "Administrator",
            password: "secret",
            configProfile: "wanDevelopment",
        });
    });

    it("uses the client certificate for certificate connections", () => {
        const options = getConnectOptions(certificateConnection);
        expect(options.authenticator).toEqual(expect.objectContaining({ certificatePath, keyPath }));
        expect(options.username).toBeUndefined();
        expect(options.password).toBeUndefined();
        expect(options.security).toBeUndefined();
    });

    it("trusts the given CA when one is set", () => {
        const options = getConnectOptions({ ...certificateConnection, caPath: "/certs/ca.pem" });
        expect(options.security).toEqual({ trustStorePath: "/certs/ca.pem" });
    });
});

describe("getRestAuth", () => {
    it("sends Basic auth for password connections", () => {
        const auth = getRestAuth(passwordConnection, "secret");
        expect(auth.headers.Authorization).toBe(`Basic ${Buffer.from("Administrator:secret").toString("base64")}`);
    });

    it("encodes non-ASCII passwords without throwing", () => {
        expect(() => getRestAuth(passwordConnection, "pässwörd€")).not.toThrow();
    });

    it("sends the client certificate, and no Authorization header, for certificate connections", () => {
        const auth = getRestAuth(certificateConnection);
        expect(auth.headers).toEqual({});
        expect(String(auth.httpsAgent.options.cert)).toContain("BEGIN CERTIFICATE");
        expect(String(auth.httpsAgent.options.key)).toContain("PRIVATE KEY");
    });
});

describe("getCertificateUsername", () => {
    it("reads the username from the certificate's CN", () => {
        expect(getCertificateUsername(certificatePath)).toBe("vscode-cert-user");
    });
});

describe("validateCertificateFiles", () => {
    it("accepts a readable certificate and an unencrypted PEM key", () => {
        expect(validateCertificateFiles(certificatePath, keyPath)).toBeUndefined();
    });

    it("requires both the certificate and the key", () => {
        expect(validateCertificateFiles(certificatePath, "")).toMatch(/both/);
        expect(validateCertificateFiles(undefined, keyPath)).toMatch(/both/);
    });

    it("reports missing files by name", () => {
        expect(validateCertificateFiles(fixture("missing.pem"), keyPath)).toMatch(/Client certificate file not found/);
        expect(validateCertificateFiles(certificatePath, fixture("missing.key"))).toMatch(/Private key file not found/);
        expect(validateCertificateFiles(certificatePath, keyPath, fixture("missing-ca.pem"))).toMatch(/CA certificate file not found/);
    });

    it("rejects a file that is not a certificate", () => {
        expect(validateCertificateFiles(keyPath, keyPath)).toMatch(/Could not read the client certificate/);
    });

    it("rejects encrypted keys, which the SDK cannot use", () => {
        expect(validateCertificateFiles(certificatePath, fixture("fake-encrypted.key"))).toMatch(/Encrypted private keys/);
    });

    it("rejects a key that is not PEM", () => {
        expect(validateCertificateFiles(certificatePath, certificatePath)).toMatch(/must be a PEM file/);
    });
});

describe("getCliCertificateArgs", () => {
    const connection = { ...certificateConnection, certificatePath: "/a b/client.pem", keyPath: "/a b/client.key", caPath: "/a b/ca.pem" };

    it("quotes the file paths so folders with spaces work in the terminal", () => {
        expect(getCliCertificateArgs(connection, { certificate: "--client-cert", key: "--client-key" }))
            .toEqual(["--client-cert", '"/a b/client.pem"', "--client-key", '"/a b/client.key"']);
    });

    it("adds the CA only when the tool has a CA option and the connection has a CA file", () => {
        expect(getCliCertificateArgs(connection, { certificate: "--c", key: "--k", ca: "--ca" })).toContain('"/a b/ca.pem"');
        expect(getCliCertificateArgs({ ...connection, caPath: undefined }, { certificate: "--c", key: "--k", ca: "--ca" })).not.toContain("--ca");
    });
});
