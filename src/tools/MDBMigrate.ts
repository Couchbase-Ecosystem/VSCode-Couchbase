import { CBTools, Type } from "../util/DependencyDownloaderUtils/CBTool";
import { getActiveConnection, getConnectionId } from "../util/connections";
import { Constants } from "../util/constants";
import * as vscode from "vscode";
import { SecretService } from "../util/secretService";
import { getCliCertificateArgs, isCertificateAuth } from "../util/connectionAuth";

export class MDBToCB {
    static async export(
        mDBConnectionString: string,
        databases: string,
        collections: string[],
        indexes: string,
        cbBucket: string,
        cbScope: string,
    ): Promise<void> {
        const connection = getActiveConnection();
        if (!connection) {
            return;
        }

        const useCertificate = isCertificateAuth(connection);
        let password: string | undefined;
        if (!useCertificate) {
            const secretService = SecretService.getInstance();
            password = await secretService.get(`${Constants.extensionID}-${getConnectionId(connection)}`);
            if (!password) {
                return undefined;
            }
        }
        try {
            // Traverse the collections to build seperate commands
            for (const collection of collections) {
                // Build Command
                const cmd: string[] = [];
                cmd.push(CBTools.getTool(Type.CB_MIGRATE).path);
                cmd.push("mongo ");
                cmd.push("--mongodb-uri");
                cmd.push(mDBConnectionString);
                cmd.push("--mongodb-database");
                cmd.push(databases);
                cmd.push("--mongodb-collection");
                cmd.push(collection);
                cmd.push("--cb-cluster");
                cmd.push(connection.url);
                if (indexes) {
                    cmd.push("--copy-indexes");
                }
                if (useCertificate) {
                    cmd.push(...getCliCertificateArgs(connection, { certificate: "--cb-client-cert", key: "--cb-client-key", ca: "--cb-cacert" }));
                } else {
                    cmd.push("--cb-username");
                    cmd.push(connection.username);
                    cmd.push("--cb-password");
                    cmd.push("'" + password + "'");
                }
                cmd.push("--cb-bucket");
                cmd.push(cbBucket);
                cmd.push("--cb-scope");
                cmd.push(cbScope);
                cmd.push("--cb-generate-key");
                cmd.push("%_id%");

                cmd.push("; \n");

                // Run Command
                const terminal: vscode.Terminal =
                    vscode.window.createTerminal("MDBToCb");
                const text = cmd.join(" ");
                terminal.sendText(text);
                terminal.show();
            }
        } catch (error) {
            console.error(
                "An error occurred while trying to migrate the databases from mongodb to couchbase"
            );
            console.error(error);
        }
    }
}
