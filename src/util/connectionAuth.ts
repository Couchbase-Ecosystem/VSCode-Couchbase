import * as fs from "fs";
import * as https from "https";
import { X509Certificate } from "crypto";
import { CertificateAuthenticator, ConnectOptions } from "couchbase";
import { IConnection } from "../types/IConnection";

export const isCertificateAuth = (connection: Pick<IConnection, "authType">): boolean =>
    connection.authType === "certificate";

/**
 * Options for couchbase.connect(): a client certificate for certificate connections,
 * otherwise username and password.
 */
export const getConnectOptions = (connection: IConnection, password?: string): ConnectOptions => {
    if (isCertificateAuth(connection)) {
        return {
            authenticator: new CertificateAuthenticator(connection.certificatePath!, connection.keyPath!),
            ...(connection.caPath ? { security: { trustStorePath: connection.caPath } } : {}),
            configProfile: "wanDevelopment",
        };
    }
    return { username: connection.username, password, configProfile: "wanDevelopment" };
};

/**
 * Headers and TLS agent for the cluster's REST APIs. Certificate connections authenticate
 * with the client certificate during the TLS handshake, so they send no Authorization header.
 */
export const getRestAuth = (connection: IConnection, password?: string): { headers: Record<string, string>; httpsAgent: https.Agent } => {
    if (isCertificateAuth(connection)) {
        return {
            headers: {},
            httpsAgent: new https.Agent({
                cert: fs.readFileSync(connection.certificatePath!),
                key: fs.readFileSync(connection.keyPath!),
                // Same as password connections: the cluster's TLS certificate is not verified here
                rejectUnauthorized: false,
            }),
        };
    }
    return {
        headers: { Authorization: `Basic ${Buffer.from(`${connection.username}:${password}`).toString("base64")}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    };
};

/** The username a client certificate maps to, read from its subject CN. */
export const getCertificateUsername = (certificatePath: string): string => {
    const certificate = new X509Certificate(fs.readFileSync(certificatePath));
    const commonName = certificate.subject.split("\n").find((part) => part.startsWith("CN="));
    if (!commonName) {
        throw new Error("The certificate has no CN (common name) to use as the username");
    }
    return commonName.substring("CN=".length);
};

/**
 * Checks the files of a certificate connection before connecting, so the user gets a clear
 * message instead of an SDK timeout. Returns an error message, or undefined when they look valid.
 */
export const validateCertificateFiles = (certificatePath?: string, keyPath?: string, caPath?: string): string | undefined => {
    if (!certificatePath || !keyPath) {
        return "Choose both a client certificate and its private key";
    }
    for (const [label, file] of [["Client certificate", certificatePath], ["Private key", keyPath], ["CA certificate", caPath]] as const) {
        if (file && !fs.existsSync(file)) {
            return `${label} file not found: ${file}`;
        }
    }
    try {
        getCertificateUsername(certificatePath);
    } catch (err) {
        return `Could not read the client certificate: ${err instanceof Error ? err.message : err}`;
    }
    const key = fs.readFileSync(keyPath, "utf8");
    if (key.includes("ENCRYPTED")) {
        return "Encrypted private keys are not supported yet; use an unencrypted PEM key";
    }
    if (!key.includes("PRIVATE KEY")) {
        return "The private key must be a PEM file";
    }
    return undefined;
};

const quoteArgument = (value: string): string => `"${value.replace(/"/g, '\\"')}"`;

/**
 * Options that make a Couchbase command-line tool (cbimport, cbexport, cbmigrate) log in with the
 * connection's client certificate, used instead of the username and password options.
 * The flag names differ per tool; the CA option is only added when a flag name and a CA file are given.
 */
export const getCliCertificateArgs = (
    connection: IConnection,
    flags: { certificate: string; key: string; ca?: string }
): string[] => {
    const args = [flags.certificate, quoteArgument(connection.certificatePath!), flags.key, quoteArgument(connection.keyPath!)];
    if (flags.ca && connection.caPath) {
        args.push(flags.ca, quoteArgument(connection.caPath));
    }
    return args;
};
