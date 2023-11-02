import { CBTools, Type } from "../util/DependencyDownloaderUtils/CBTool";
import { getActiveConnection, getConnectionId } from "../util/connections";
import { Constants } from "../util/constants";
import { getCurrentDateTime } from "../util/util";
import * as keytar from "keytar";
import * as vscode from 'vscode';

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
        verbose: boolean
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
        let currentPath: string;

        if (filePath.endsWith("/")) { //TODO: Verify for windows
            currentPath = filePath + fileName;
        } else {
            currentPath = `${filePath}/${fileName}`;
        }

        const includeData = scp.join(",");
        const fullPath = `\"${currentPath}\"`;

        const password = await keytar.getPassword(Constants.extensionID, getConnectionId(connection));
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
            cmd.push("-p");
            cmd.push('"' + password + '"'); 
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

            // Run Command
            const terminal = vscode.window.createTerminal("CBExport");
            let text = cmd.join(" ");
            terminal.sendText(text);
            terminal.show();
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
