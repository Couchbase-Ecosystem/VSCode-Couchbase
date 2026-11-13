import * as fs from "fs";
import * as os from "os";
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

    it("verifies the cluster against the chosen CA for certificate connections", () => {
        const auth = getRestAuth({ ...certificateConnection, caPath: certificatePath });
        expect(auth.httpsAgent.options.rejectUnauthorized).toBe(true);
        expect(String(auth.httpsAgent.options.ca)).toContain("BEGIN CERTIFICATE");
    });

    it("still verifies the cluster (against the system's CAs) when no CA is chosen", () => {
        const auth = getRestAuth(certificateConnection);
        expect(auth.httpsAgent.options.rejectUnauthorized).toBe(true);
        expect(auth.httpsAgent.options.ca).toBeUndefined();
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

    for (const character of ["$", "`", '"', "\n", "\r"]) {
        it(`refuses paths containing ${JSON.stringify(character)}, which a terminal would interpret`, () => {
            const unsafe = `/tmp/bad${character}name.pem`;
            expect(validateCertificateFiles(unsafe, keyPath)).toMatch(/Client certificate path can't contain/);
            expect(validateCertificateFiles(certificatePath, unsafe)).toMatch(/Private key path can't contain/);
            expect(validateCertificateFiles(certificatePath, keyPath, unsafe)).toMatch(/CA certificate path can't contain/);
        });
    }

    it("accepts ordinary paths with spaces, quotes and Windows backslashes", () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cert test 'dir' "));
        const cert = path.join(dir, "client.pem");
        const key = path.join(dir, "client.key");
        fs.copyFileSync(certificatePath, cert);
        fs.copyFileSync(keyPath, key);
        try {
            expect(validateCertificateFiles(cert, key)).toBeUndefined();
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
        expect(validateCertificateFiles("C:\\Users\\me\\client.pem", keyPath)).toMatch(/file not found/);
    });

    it("reports an unreadable private key instead of failing", () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cert-test-"));
        const key = path.join(dir, "client.key");
        fs.copyFileSync(keyPath, key);
        fs.chmodSync(key, 0o000);
        try {
            expect(validateCertificateFiles(certificatePath, key)).toMatch(/Could not read the private key/);
        } finally {
            fs.chmodSync(key, 0o600);
            fs.rmSync(dir, { recursive: true, force: true });
        }
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
