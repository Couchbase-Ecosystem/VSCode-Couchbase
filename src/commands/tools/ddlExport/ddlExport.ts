import * as vscode from "vscode";
import * as path from 'path';
import { IConnection } from "../../../types/IConnection";
import { getActiveConnection } from "../../../util/connections";
import { logger } from "../../../logger/logger";
import { getLoader } from "../../../webViews/loader.webview";
import { ddlExportWebview } from "../../../webViews/tools/ddlExport.webview";
import { QueryIndex, ScopeSpec } from "couchbase";
import { getCurrentDateTime } from "../../../util/util";
import * as fs from "fs";
import { getIndexDefinition } from "../../../util/indexUtils";

const validateFormData = (formData: any): string => {
    const errors = [];

    if (!formData.bucket) {
        errors.push("Please select a bucket");
    } else {
        if (formData.scopes.length === 0) {
            errors.push("Select one or more scopes");
        }
    }

    if (!formData.fileDestination.trim()) {
        errors.push("Please inform the file destination folder");
    }

    if (errors.length > 0) {
        return errors.join("<br>");
    }

    return "";
};

class DDLExport {
    private static async exportScope(bucket: string, scope: ScopeSpec, includeIndexes: boolean): Promise<string> {
        const ddlExportData: string[] = [];
        const scopePrefix = "`" + bucket + "`.`" + scope.name + "`";

        if ("_default" !== scope.name) {
            ddlExportData.push("CREATE SCOPE " + scopePrefix + ";");
        }
        ddlExportData.push("\n");
        const connection = getActiveConnection();
        if (!connection) {
            return "";
        }

        for (const collectionSpec of scope.collections) {
            ddlExportData.push("\n");
            ddlExportData.push("/* DDL for collection " + scope.name + "." + collectionSpec.name + " */");
            ddlExportData.push("\n");
            if ("_default" !== collectionSpec.name) {
                ddlExportData.push("CREATE COLLECTION " + scopePrefix + ".`" + collectionSpec.name + "`; \n");
            }
            if (includeIndexes) {
                const result = await listIndexes(connection, bucket, scope.name, collectionSpec.name);
                ddlExportData.push(result?.map(index => getIndexDefinition(index)).join("; \n")!);
                if (result!.length > 1) {
                    ddlExportData.push("; \n");
                }
            }
            ddlExportData.push("\n");
        }

        ddlExportData.push("\n\n");

        return ddlExportData.join("");
    }

    public async exportScope(bucket: string, scopes: string[], filePath: string, includeIndexes: boolean): Promise<void> {
        try {
            const connection = getActiveConnection();
            if (!connection) {
                return;
            }

            const ifAllScopes = scopes.includes("All Scopes");
            const ddlExportData: string[] = [];
            const allScopes = await connection?.cluster?.bucket(bucket).collections().getAllScopes()!;
            const selectedScopes: ScopeSpec[] = ifAllScopes ? allScopes : allScopes.filter(a => scopes.includes(a.name));

            for (const scope of selectedScopes) {
                ddlExportData.push("/*************************/ \n");
                ddlExportData.push("/** Scope " + scope.name + " */ \n");
                ddlExportData.push("/*************************/ \n");
                ddlExportData.push(await DDLExport.exportScope(bucket, scope, includeIndexes));
                ddlExportData.push("\n");
            }

            let fileName = bucket + "_" + (ifAllScopes ? "_all_" : DDLExport.getScopesFileName(scopes)) + getCurrentDateTime() + ".sqlpp";
            if (!filePath.endsWith("/")) {
                fileName = "/" + fileName;
            }
            const fullPath = filePath + fileName;
            fs.writeFile(fullPath, ddlExportData.join(''), function (err) {
                if (err) { throw err; }
                vscode.window.showInformationMessage("DDL Export: File exported successfully");
            });

        } catch (e) {
            logger.error("An error occurred while writing to export the DDL: " + e);
        }
    };

    public static getScopesFileName(scopes: string[]): string {
        if (scopes.length === 1) {
            return scopes[0] + "_";
        } else {
            return scopes.length + "_scopes_";
        }
    }
};

export const listIndexes = async (connection: IConnection, bucket: string, scope: string, collection: string): Promise<QueryIndex[] | undefined> => {
    if (connection) {
        try {
            const result = await connection?.cluster?.queryIndexes().getAllIndexes(bucket, { scopeName: scope, collectionName: collection });
            return result;
        } catch {
            return [];
        }
    }

};

export const ddlExport = async () => {
    const connection = getActiveConnection();
    if (!connection) {
        return;
    }
    const currentPanel = vscode.window.createWebviewPanel(
        "ddlExport",
        "DDL Export",
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            enableForms: true,
        }
    );
    currentPanel.iconPath = {
        dark: vscode.Uri.file(
            path.join(__filename, "..", "..", "images", "dark", "export_dark.svg")
        ),
        light: vscode.Uri.file(
            path.join(__filename, "..", "..", "images", "light", "export_light.svg")
        ),
    };
    currentPanel.webview.html = getLoader("DDL Export");

    // Get all buckets
    const buckets = await connection.cluster?.buckets().getAllBuckets();
    if (buckets === undefined) {
        vscode.window.showErrorMessage("Buckets not found");
        return;
    }

    const bucketNameArr: string[] = buckets.map(b => b.name);
    try {
        currentPanel.webview.html = await ddlExportWebview(bucketNameArr);
        currentPanel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "vscode-couchbase.tools.DDLExport.runExport":
                    const formData = message.data;
                    const validationError = validateFormData(formData);
                    if (validationError === "") {
                        const ddl = new DDLExport();
                        ddl.exportScope(formData.bucket,
                            formData.scopes, formData.fileDestination, formData.includeIndexes);
                    } else {
                        currentPanel.webview.postMessage({
                            command: "vscode-couchbase.tools.DDLExport.formValidationError",
                            error: validationError,
                        });
                    }
                    break;
                case "vscode-couchbase.tools.DDLExport.getScopes":
                    const scopes = await connection.cluster
                        ?.bucket(message.bucketId)
                        .collections()
                        .getAllScopes();
                    if (scopes === undefined) {
                        vscode.window.showErrorMessage("Scopes are undefined");
                        break;
                    }

                    currentPanel.webview.postMessage({
                        command: "vscode-couchbase.tools.DDLExport.scopesInfo",
                        scopes: scopes,
                    });
                    break;
                case "vscode-couchbase.tools.DDLExport.getFolder":
                    const options: vscode.OpenDialogOptions = {
                        canSelectMany: false,
                        openLabel: "Choose Destination Folder",
                        canSelectFiles: false,
                        canSelectFolders: true,
                    };

                    vscode.window.showOpenDialog(options).then((fileUri) => {
                        if (fileUri && fileUri[0]) {
                            currentPanel.webview.postMessage({
                                command: "vscode-couchbase.tools.DDLExport.folderInfo",
                                folder: fileUri[0].fsPath,
                            });
                        }
                    });
                    break;
            }
        });
    } catch (err) {
        logger.error(`Failed to open data export webview`);
        logger.debug(err);
        vscode.window.showErrorMessage(
            "Failed to open data export webview: " + err
        );
    }
};