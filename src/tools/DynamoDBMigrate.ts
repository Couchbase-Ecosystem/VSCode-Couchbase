import { CBTools, Type } from "../util/DependencyDownloaderUtils/CBTool";
import { getActiveConnection, getConnectionId } from "../util/connections";
import { Constants } from "../util/constants";
import * as vscode from "vscode";
import { SecretService } from "../util/secretService";
import { getCliCertificateArgs, isCertificateAuth } from "../util/connectionAuth";

export class DynamoDBToCb {
    static async export(
        useAwsProfile: boolean,
        awsProfile: string,
        awsRegion: string,
        tables: string[],
        awsAccessKey: string,
        awsSecretKey: string,
        cbBucket: string,
        cbScope: string,
        indexes: string,
        debug: boolean,
        noSslVerify: boolean
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
            // Build Command
            for (const table of tables) {
                const cmd: string[] = [];
                cmd.push(CBTools.getTool(Type.CB_MIGRATE).path);
                cmd.push("dynamodb ");
                if (useAwsProfile) {
                    cmd.push("--aws-profile");
                    cmd.push(awsProfile);
                } else {
                    cmd.push("--aws-access-key-id");
                    cmd.push(awsAccessKey);
                    cmd.push("--aws-secret-access-key");
                    cmd.push(awsSecretKey)
                }
                cmd.push("--dynamodb-table-name");
                cmd.push(table);
                cmd.push("--cb-bucket");
                cmd.push(cbBucket);
                cmd.push("--cb-scope");
                cmd.push(cbScope);
                cmd.push("--aws-region");
                cmd.push(awsRegion);

                cmd.push("--cb-collection")
                cmd.push(table)

                cmd.push("--cb-cluster")
                cmd.push(connection.url)
                if (useCertificate) {
                    // cbmigrate ignores the CA when --cb-no-ssl-verify is also given, so only pass one of them
                    cmd.push(...getCliCertificateArgs(connection, {
                        certificate: "--cb-client-cert",
                        key: "--cb-client-key",
                        ca: noSslVerify ? undefined : "--cb-cacert",
                    }));
                } else {
                    cmd.push("--cb-username");
                    cmd.push(connection.username);
                }

                if (indexes) {
                    cmd.push("--copy-indexes")
                }

                if (!useCertificate) {
                    cmd.push("--cb-password");
                    cmd.push("'" + password + "'");
                }


                if (debug) {
                    cmd.push("--debug")
                }

                if (noSslVerify) {
                    cmd.push("--cb-no-ssl-verify true")
                }


                cmd.push("; \n");

                // Run Command
                const terminal: vscode.Terminal =
                    vscode.window.createTerminal("DynamoDBToCb");
                const text = cmd.join(" ");
                terminal.sendText(text);
                terminal.show();
            }
        } catch (error) {
            console.error(
                "An error occurred while trying to migrate the tables from DynamoDb to couchbase"
            );
            console.error(error);
        }
    }
}

