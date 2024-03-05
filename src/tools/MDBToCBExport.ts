import { CBTools, Type } from "../util/DependencyDownloaderUtils/CBTool";
import { getActiveConnection, getConnectionId } from "../util/connections";
import { Constants } from "../util/constants";
import * as keytar from "keytar";
import * as vscode from 'vscode';

export class MDBToCB {
    static async export(
        mDBConnectionString: string,
        databases: string,
        collections: string[],
        indexes: string,
        cbBucket: string,
        cbScope: string,
        context: vscode.ExtensionContext
    ): Promise<void> {

        const connection = getActiveConnection();
        if (!connection) {
            return;
        }


        const password = await keytar.getPassword(Constants.extensionID, getConnectionId(connection));
        if (!password) {
            return undefined;
        }
        try {
            for (const collection of collections) {
                    // Build Command
                    const cmd: string[] = [];
                    cmd.push(CBTools.getTool(Type.CB_MIGRATE).path);
                    cmd.push("mongo ")
                    cmd.push("--mongodb-uri");
                    cmd.push(mDBConnectionString);
                    cmd.push("--mongodb-database");
                    cmd.push(databases)
                    cmd.push("--mongodb-collection");
                    cmd.push(collection);
                    cmd.push("--cb-cluster");
                    cmd.push(connection.url);
                    if (indexes){
                        cmd.push("--copy-indexes");
                    }
                    cmd.push("--cb-username");
                    cmd.push(connection.username);
                    cmd.push("--cb-password");
                    cmd.push(password);
                    cmd.push("--cb-bucket");
                    cmd.push(cbBucket);
                    cmd.push("--cb-scope");
                    cmd.push(cbScope);
                    // cmd.push("--cb-collection");
                    // cmd.push(colCB);
                    cmd.push("--cb-generate-key");
                    cmd.push("%_id%");

                    cmd.push("; \n");
                    cmd.push("export CB_PASSWORD=''"); // To make sure that password is truly unset

                    // Run Command
                    const terminal: vscode.Terminal = vscode.window.createTerminal("MDBToCb");
                    // sending password to vscode environment variables. Note: Password is still accessible via terminal, till its removed
                    context.environmentVariableCollection.replace('CB_PASSWORD', password);
                    let text = cmd.join(" ");
                    terminal.sendText(text);
                    terminal.show();
                    // removing password from vscode environment variables after 5 seconds
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    context.environmentVariableCollection.replace('CB_PASSWORD', '');
            }
        } catch (error) {
            console.error("An error occurred while trying to migrate the databases from mongodb to couchbase");
            console.error(error);
        }
    }

}