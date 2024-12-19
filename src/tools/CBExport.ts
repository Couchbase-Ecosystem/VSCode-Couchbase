import { CBTools, Type } from "../util/DependencyDownloaderUtils/CBTool";
import { getActiveConnection, getConnectionId } from "../util/connections";
import { Constants } from "../util/constants";
import { getCurrentDateTime } from "../util/util";
import * as vscode from 'vscode';
import * as path from 'path';
import { SecretService } from "../util/secretService";

export class CBExport {
    static async export(
        bucket: string,
        scopes: string[],
        cols: string[],
        filePath: string,
        keyName: string,
        scopeName: string,
        colName: string,
        format: string,
        threads: string,
        verbose: boolean, 
        context: vscode.ExtensionContext
    ): Promise<void> {

        const connection = getActiveConnection();
        if(!connection){
            return;
        }

        const allScopes = scopes.includes("All Scopes");
        const scp: string[] = [];
        const collections: string[] = [];

        if (!allScopes) {
            for (const col of cols) {
                if (col.includes(" ")) { // All XXX (XXX represents scopeName)
                    scp.push(col.split(" ")[1]);
                }
            }

            for (const col of cols) {
                if (!col.includes(" ") && !CBExport.hasAnyScope(col, scp)) {
                    collections.push(col);
                }
            }
        }

        scp.push(...collections);

        const fileName = `${bucket}_cbexport_${getCurrentDateTime()}.json`;
        let currentPath: string = path.join(filePath, fileName);

        const includeData = scp.join(",");
        const fullPath = `\"${currentPath}\"`;

        const secretService = SecretService.getInstance();
        const password = await secretService.get(`${Constants.extensionID}-${getConnectionId(connection)}`);
        if (!password) {
            return undefined;
        }

        try {
            // Build Command
            const cmd: string[] = [];
            cmd.push(CBTools.getTool(Type.CB_EXPORT).path);
            cmd.push("json");
            cmd.push("--no-ssl-verify");
            cmd.push("-c");
            cmd.push(connection.url);
            cmd.push("-u");
            cmd.push(connection.username);
            // cmd.push("-p");
            // cmd.push('"' + password + '"'); 
            cmd.push("-b");
            cmd.push(bucket);

            if (!allScopes) {
                cmd.push("--include-data");
                cmd.push(includeData);
            }

            cmd.push("--scope-field");
            cmd.push(scopeName);
            cmd.push("--collection-field");
            cmd.push(colName);
            cmd.push("--include-key");
            cmd.push(keyName);
            cmd.push("-f");
            cmd.push(format);
            cmd.push("-o");
            cmd.push(fullPath);
            cmd.push("-t");
            cmd.push(threads);

            if (verbose) {
                cmd.push("-v");
            }

            cmd.push("; \n");
            cmd.push("export CB_PASSWORD=''"); // To make sure that password is truly unset

            // Run Command
            const terminal: vscode.Terminal = vscode.window.createTerminal("CBExport");
            // sending password to vscode environment variables. Note: Password is still accessible via terminal, till its removed
            context.environmentVariableCollection.replace('CB_PASSWORD', password);
            let text = cmd.join(" ");
            terminal.sendText(text);
            terminal.show();
            // removing password from vscode environment variables after 5 seconds
            await new Promise((resolve)=>setTimeout(resolve, 5000));
            context.environmentVariableCollection.replace('CB_PASSWORD', '');
        } catch (error) {
            console.error("An error occurred while trying to export the dataset");
            console.error(error);
        }
    }

    private static hasAnyScope(collection: string, scopes: string[]): boolean {
        for (const scope of scopes) {
          if (collection.startsWith(`${scope}.`)) {
            return true;
          }
        }
        return false;
      }
}
