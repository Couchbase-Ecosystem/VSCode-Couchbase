import { CBTools, Type } from "../util/DependencyDownloaderUtils/CBTool";
import { getActiveConnection, getConnectionId } from "../util/connections";
import { Constants } from "../util/constants";
import * as vscode from "vscode";
import { SecretService } from "../util/secretService";
import { exec } from "child_process";

export class HuggingFaceToCouchbase {
    static async runCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("Error executing command:", error);
                    reject(stderr || error.message);
                } else {
                    resolve(stdout); // Return the output of the command
                }
            });
        });
    }
    static async listConfigs(
        repositoryPath: string
    ): Promise<string | undefined> {
        const connection = getActiveConnection();
        if (!connection) {
            return undefined;
        }
        const secretService = SecretService.getInstance();
        const password = await secretService.get(
            `${Constants.extensionID}-${getConnectionId(connection)}`
        );
        if (!password) {
            return undefined;
        }
        try {
            const cmd: string[] = [];
            cmd.push(CBTools.getTool(Type.CB_MIGRATE).path);
            cmd.push("hugging-face");
            cmd.push("list-configs");
            cmd.push("--path");
            cmd.push(repositoryPath);
            cmd.push('--json-output');

            const command = cmd.join(" ");
            const result = await this.runCommand(command); // Run the command and capture the output
            return result; // Return the output
        } catch (error) {
            console.error("An error occurred while trying to list the configs");
            console.error(error);
            return undefined;
        }
    }

    static async listSplits(
        repositoryPath: string
    ): Promise<string | undefined> {
        const connection = getActiveConnection();
        if (!connection) {
            return undefined;
        }
        const secretService = SecretService.getInstance();
        const password = await secretService.get(
            `${Constants.extensionID}-${getConnectionId(connection)}`
        );
        if (!password) {
            return undefined;
        }
        try {
            const cmd: string[] = [];
            cmd.push(CBTools.getTool(Type.CB_MIGRATE).path);
            cmd.push("hugging-face");
            cmd.push("list-splits");
            cmd.push("--path");
            cmd.push(repositoryPath);

            const command = cmd.join(" ");
            const result = await this.runCommand(command); // Run the command and capture the output
            return result; // Return the output
        } catch (error) {
            console.error("An error occurred while trying to list the splits");
            console.error(error);
            return undefined;
        }
    }

    static async listFields(
        repositoryPath: string
    ): Promise<string | undefined> {
        const connection = getActiveConnection();
        if (!connection) {
            return undefined;
        }
        const secretService = SecretService.getInstance();
        const password = await secretService.get(
            `${Constants.extensionID}-${getConnectionId(connection)}`
        );
        if (!password) {
            return undefined;
        }
        try {
            const cmd: string[] = [];
            cmd.push(CBTools.getTool(Type.CB_MIGRATE).path);
            cmd.push("hugging-face");
            cmd.push("list-fields");
            cmd.push("--path");
            cmd.push(repositoryPath);

            const command = cmd.join(" ");
            const result = await this.runCommand(command); // Run the command and capture the output
            return result; // Return the output
        } catch (error) {
            console.error("An error occurred while trying to list the fields");
            console.error(error);
            return undefined;
        }
    }

    static async export(
        datasetPath: string,
        idField: string,
        cbBucket: string,
        cbScope: string,
        cbCollection: string
    ): Promise<void> {
        const connection = getActiveConnection();
        if (!connection) {
            return;
        }

        const secretService = SecretService.getInstance();
        const password = await secretService.get(
            `${Constants.extensionID}-${getConnectionId(connection)}`
        );
        if (!password) {
            return undefined;
        }
        try {
            // Build Command
            const cmd: string[] = [];
            cmd.push(CBTools.getTool(Type.CB_MIGRATE).path);
            cmd.push("hf_to_cb_dataset_migrator");
            cmd.push("migrate");
            cmd.push("--path");
            cmd.push(datasetPath);
            cmd.push("--id-fields");
            cmd.push(idField);
            cmd.push("--cb-url");
            cmd.push(connection.url);
            cmd.push("--cb-username");
            cmd.push(connection.username);
            cmd.push("--cb-password");
            cmd.push("'" + password + "'");
            cmd.push("--cb-bucket");
            cmd.push(cbBucket);
            cmd.push("--cb-scope");
            cmd.push(cbScope);
            cmd.push("--cb-collection");
            cmd.push(cbCollection);
            cmd.push("; \n");

            // Run Command
            const terminal: vscode.Terminal =
                vscode.window.createTerminal("HFToCbExport");
            const text = cmd.join(" ");
            terminal.sendText(text);
            terminal.show();
        } catch (error) {
            console.error(
                "An error occurred while trying to migrate the dataset from Hugging Face to Couchbase"
            );
            console.error(error);
        }
    }
}
