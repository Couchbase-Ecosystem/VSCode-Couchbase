import { getActiveConnection, getConnectionId } from "../util/connections";
import * as vscode from 'vscode';
import * as keytar from "keytar";
import { Constants } from "../util/constants";
import { logger } from "../logger/logger";
import { IConnection } from "../types/IConnection";
import { CBTools, Type } from "../util/DependencyDownloaderUtils/CBTool";

export interface ICBImportData {
    bucket: string;
    dataset: string;
    fileFormat: string;
    scopeCollectionExpression: string;
    generateKeyExpression: string;
    skipDocsOrRows: string | undefined;
    limitDocsOrRows: string | undefined;
    ignoreFields: string | undefined;
    threads: number;
    verbose: boolean;
    format: string;
}

export class CBImport {

    static async import(importData: ICBImportData): Promise<void> {
        const connection = getActiveConnection();
        if(!connection){
            return;
        }
        console.log(importData);
        let cmd: string[] | Error;
        // CMD Builder
        try {
            cmd = await this.cmdBuilder(importData, connection);
            if (cmd instanceof Error) {
                throw cmd;
            }
            console.log(cmd);
        } catch(err) {
            logger.error("Error while building command for CB Import, please check values and try again");
            logger.debug(err);
            vscode.window.showErrorMessage("Error while building command for CB Import, please check values and try again, err: "+err);
            return;
        }

        // CMD Runner
        try {
            const terminal = vscode.window.createTerminal("CBImport");
            let text = cmd.join(" ");
            console.log(text);

            terminal.sendText(text);
            terminal.show();
            
        } catch(err) {
            logger.error("Error while running command for CB Import");
            logger.debug(err);
            vscode.window.showErrorMessage("Error while running command for CB Import, err: "+err);
        }
    }

    static async cmdBuilder(importData: ICBImportData, connection: IConnection): Promise<string[] | Error> {

        const password = await keytar.getPassword(Constants.extensionID, getConnectionId(connection));
        if (!password) {
            return new Error("Password not found");
        }

        const cmd: string[] = []; 
        cmd.push(CBTools.getTool(Type.CB_IMPORT).path);
        cmd.push(importData.fileFormat);
        cmd.push("--no-ssl-verify");

        // Cluster details
        cmd.push("-c");
        cmd.push(connection.url);
        cmd.push("-u");
        cmd.push(connection.username);
        cmd.push("-p");
        cmd.push(password);
        cmd.push("-b");
        cmd.push(importData.bucket);

        // Dataset details
        cmd.push("--dataset");
        cmd.push(`\"file://${importData.dataset}\"`);

        if(importData.fileFormat === "json"){ // If JSON File Format, Lines or Lists needs to be specified as file type
            cmd.push("--format");
            cmd.push(importData.format);
        }
        if(importData.fileFormat === "csv"){ // Field Seperator is taken as ',' by default and only required in case of CSV File Format
            cmd.push("--field-seperator");
            cmd.push(",");
            cmd.push("--infer-types"); // Adding infer types flag as well for csv
        }

        // Target Details
        cmd.push("--scope-collection-exp");
        cmd.push(importData.scopeCollectionExpression);

        // Key Details
        cmd.push("--generate-key");
        cmd.push(importData.generateKeyExpression);

        cmd.push("--generator-delimiter"); // Using default generator delimiter of '#'
        cmd.push("#");

        // Advanced Settings
        if(importData.skipDocsOrRows && importData.skipDocsOrRows.trim() !== ""){
            if(importData.fileFormat === "json") {
                cmd.push("--skip-docs");
            } else if(importData.fileFormat === "csv") {
                cmd.push("--skip-rows");
            }
            cmd.push(importData.skipDocsOrRows);
        }

        if(importData.limitDocsOrRows && importData.limitDocsOrRows.trim() !== ""){
            if(importData.fileFormat === "json") {
                cmd.push("--limit-docs");
            } else if(importData.fileFormat === "csv") {
                cmd.push("--limit-rows");
            }
            cmd.push(importData.limitDocsOrRows);
        }

        if(importData.ignoreFields && importData.ignoreFields.trim() !== ""){
            cmd.push("--ignore-fields");
            cmd.push(importData.ignoreFields);
        }

        cmd.push("--threads");
        cmd.push(importData.threads.toString());
        
        if (importData.verbose) {
            cmd.push("-v");
        }

        return cmd;

    }
}