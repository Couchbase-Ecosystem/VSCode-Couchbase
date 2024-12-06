import { CBTools, Type } from "../util/DependencyDownloaderUtils/CBTool";
import { getActiveConnection, getConnectionId } from "../util/connections";
import { Constants } from "../util/constants";
import * as vscode from "vscode";
import { SecretService } from "../util/secretService";

export class HuggingFaceToCouchbase {
    static async listConfigs(repositoryPath: string): Promise<void> {
        const connection = getActiveConnection();
        if (!connection) {
            return undefined;
        }
        const secretService = SecretService.getInstance();
        const password = await secretService.get(`${Constants.extensionID}-${getConnectionId(connection)}`);
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
            cmd.push("; \n");

            const terminal: vscode.Terminal =
                vscode.window.createTerminal("HFToCb");
            const text = cmd.join(" ");
            terminal.sendText(text);
            terminal.show();
        } catch (error) {
            console.error(
                "An error occurred while trying to list the configs"
            );
            console.error(error);
        }
    }

    static async listSplits(repositoryPath: string): Promise<void> {
        const connection = getActiveConnection();
        if (!connection) {
            return undefined;
        }
        const secretService = SecretService.getInstance();
        const password = await secretService.get(`${Constants.extensionID}-${getConnectionId(connection)}`);
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
            cmd.push("; \n");

            const terminal: vscode.Terminal =
                vscode.window.createTerminal("HFToCb");
            const text = cmd.join(" ");
            terminal.sendText(text);
            terminal.show();
        } catch (error) {
            console.error(
                "An error occurred while trying to list the splits"
            );
            console.error(error);
        }
    }

    static async listFields(repositoryPath: string): Promise<void> {
        const connection = getActiveConnection();
        if (!connection) {
            return undefined;
        }
        const secretService = SecretService.getInstance();
        const password = await secretService.get(`${Constants.extensionID}-${getConnectionId(connection)}`);
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
            cmd.push("; \n");

            const terminal: vscode.Terminal =
                vscode.window.createTerminal("HFToCb");
            const text = cmd.join(" ");
            terminal.sendText(text);
            terminal.show();
        } catch (error) {
            console.error(
                "An error occurred while trying to list the fields"
            );
            console.error(error);
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
        const password = await secretService.get(`${Constants.extensionID}-${getConnectionId(connection)}`);
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