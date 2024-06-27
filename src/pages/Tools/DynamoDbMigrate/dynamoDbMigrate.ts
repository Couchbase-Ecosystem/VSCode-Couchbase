import {
    DynamoDBClient,
    ListTablesCommand,
    ListTablesCommandOutput
} from "@aws-sdk/client-dynamodb";
import { fromIni } from "@aws-sdk/credential-providers";
import { readFile } from "fs/promises";
import { join } from "path";
import { DynamoDBToCb } from "../../../tools/DynamoDBMigrate";
import {
    CBTools,
    Type as CBToolsType,
} from "../../../util/DependencyDownloaderUtils/CBTool";
import * as vscode from "vscode";
import { getActiveConnection } from "../../../util/connections";
import { Memory } from "../../../util/util";
import { Constants } from "../../../util/constants";
import { logger } from "../../../logger/logger";
import * as path from "path";
import { getLoader } from "../../../webViews/loader.webview";
import { dynamoDBMigrateWebView } from "../../../webViews/tools/dynamoDbMigrate.webview";
import { IConnection } from "../../../types/IConnection";

export const getScopes = async (bucketId: string, connection: IConnection) => {
    const scopes = await connection.cluster
        ?.bucket(bucketId)
        .collections()
        .getAllScopes();
    return scopes;
};

const validateFormData = (formData: any): string => {
    const errors = [];
    if (!formData.awsRegion.trim()) {
        errors.push("Please specify a Aws Region");
    }

    if (!formData.tables || formData.tables.length === 0) {
        errors.push("Please specify the DynamoDb tables field");
    }

    if (!formData.cbBucket) {
        errors.push("Please select a Couchbase bucket");
    }

    if (!formData.cbScope || formData.cbScope.length === 0) {
        errors.push("Please select a Couchbase scope field");
    }

    if (errors.length > 0) {
        return errors.join("<br>");
    }

    return "";
};


export interface IDataMigrateWebviewState {
    webviewPanel: vscode.WebviewPanel;
}

export const dynamodbMigrate = async (context: vscode.ExtensionContext) => {
    const connection = getActiveConnection();
    if (!connection) {
        return;
    }
    if (!CBTools.getTool(CBToolsType.CB_MIGRATE).isAvailable()) {
        vscode.window.showErrorMessage(
            "CB Migrate is still loading, Please try again later"
        );
        return;
    }

    const dataMigratetWebviewDetails =
        Memory.state.get<IDataMigrateWebviewState>(
            Constants.DATA_MIGRATE_DYNAMODB_WEBVIEW
        );
    if (dataMigratetWebviewDetails) {
        // data migrate webview already exists, Closing existing and creating new
        try {
            dataMigratetWebviewDetails.webviewPanel.dispose();
        } catch (e) {
            logger.error("Error while disposing data migrate webview: " + e);
        }
        Memory.state.update(Constants.DATA_MIGRATE_DYNAMODB_WEBVIEW, null);
    }

    const currentPanel = vscode.window.createWebviewPanel(
        "dataMigrate",
        "Data Migration from DynamoDB to Couchbase",
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            enableForms: true,
            retainContextWhenHidden: true
        }
    );
    Memory.state.update(Constants.DATA_MIGRATE_DYNAMODB_WEBVIEW, {
        webviewPanel: currentPanel,
    });
    currentPanel.iconPath = {
        dark: vscode.Uri.file(
            path.join(
                __filename,
                "..",
                "..",
                "images",
                "dark",
                "export_dark.svg"
            )
        ),
        light: vscode.Uri.file(
            path.join(
                __filename,
                "..",
                "..",
                "images",
                "light",
                "export_light.svg"
            )
        ),
    };
    currentPanel.webview.html = getLoader("Data Migrate");

    // Get all buckets
    const buckets = await connection.cluster?.buckets().getAllBuckets();
    if (buckets === undefined) {
        vscode.window.showErrorMessage("Buckets not found");
        return;
    }

    const awsRegions = new Map<string, string>([
        ["US East (N. Virginia)", "us-east-1"],
        ["US East (Ohio)", "us-east-2"],
        ["US West (N. California)", "us-west-1"],
        ["US West (Oregon)", "us-west-2"],
        ["Africa (Cape Town)", "af-south-1"],
        ["Asia Pacific (Hong Kong)", "ap-east-1"],
        ["Asia Pacific (Mumbai)", "ap-south-1"],
        ["Asia Pacific (Osaka)", "ap-northeast-3"],
        ["Asia Pacific (Seoul)", "ap-northeast-2"],
        ["Asia Pacific (Singapore)", "ap-southeast-1"],
        ["Asia Pacific (Sydney)", "ap-southeast-2"],
        ["Asia Pacific (Tokyo)", "ap-northeast-1"],
        ["Canada (Central)", "ca-central-1"],
        ["China (Beijing)", "cn-north-1"],
        ["China (Ningxia)", "cn-northwest-1"],
        ["Europe (Frankfurt)", "eu-central-1"],
        ["Europe (Ireland)", "eu-west-1"],
        ["Europe (London)", "eu-west-2"],
        ["Europe (Milan)", "eu-south-1"],
        ["Europe (Paris)", "eu-west-3"],
        ["Europe (Stockholm)", "eu-north-1"],
        ["Middle East (Bahrain)", "me-south-1"],
        ["South America (São Paulo)", "sa-east-1"]
    ]);

    const bucketNameArr: string[] = buckets.map((b) => b.name);
    const awsProfiles = await listProfiles()


    try {
        currentPanel.webview.html = await dynamoDBMigrateWebView(bucketNameArr, awsProfiles, awsRegions);
        currentPanel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "vscode-couchbase.tools.dynamodbMigrate.Migrate":
                    const formData = message.data;
                    const validationError = validateFormData(formData);
                    if (validationError === "") {
                        DynamoDBToCb.export(
                            formData.useAwsProfile,
                            formData.awsProfile,
                            formData.awsRegion,
                            formData.tables,
                            formData.awsAccessKey,
                            formData.awsSecretKey,
                            formData.cbBucket,
                            formData.cbScope,
                            formData.indexes,
                            formData.debug,
                            formData.sslNoVerify,
                        );
                    } else {
                        currentPanel.webview.postMessage({
                            command:
                                "vscode-couchbase.tools.dynamodbMigrate.formValidationError",
                            error: validationError,
                        });
                    }
                    break;

                case "vscode-couchbase.tools.dynamodbMigrate.getCbScopes":
                    const scopes = await getScopes(
                        message.bucketId,
                        connection
                    );
                    if (scopes === undefined) {
                        vscode.window.showErrorMessage("Scopes are undefined");
                        break;
                    }
                    currentPanel.webview.postMessage({
                        command: "vscode-couchbase.tools.dynamodbMigrate.scopesInfo",
                        scopes: scopes,
                    });
                    break;

                case "vscode-couchbase.tools.dynamodbMigrate.getTables":
                    let result: any
                    if (message.awsRegion === "") {
                        currentPanel.webview.postMessage({
                            command:
                                "vscode-couchbase.tools.dynamodbMigrate.connectValidationError",
                            error: "Please specify a AWS region",
                        });
                        break;
                    }
                    if (message.useAwsProfile) {
                        if (message.awsProfile === "") {
                            currentPanel.webview.postMessage({
                                command:
                                    "vscode-couchbase.tools.dynamodbMigrate.connectValidationError",
                                error: "Please specify a AWS profile",
                            });
                            break;
                        }
                        result = await listTablesByProfile(
                            message.awsRegion,
                            message.awsProfile
                        );
                    } else {
                        if (message.awsAccessKeyId === "" || message.awsSecretAccessKey === "") {
                            currentPanel.webview.postMessage({
                                command:
                                    "vscode-couchbase.tools.dynamodbMigrate.connectValidationError",
                                error: "Please specify  the AWS Access and Secret Key",
                            });
                            break;
                        }
                        result = await listTables(
                            message.awsRegion,
                            message.awsAccessKeyId,
                            message.awsSecretAccessKey,
                        );
                    }
                    if (result.error) {
                        currentPanel.webview.postMessage({
                            command:
                                "vscode-couchbase.tools.dynamodbMigrate.connectValidationError",
                            error: result.error,
                        });
                    } else {
                        currentPanel.webview.postMessage({
                            command:
                                "vscode-couchbase.tools.dynamodbMigrate.tableInfo",
                            tables: result.tables,
                        });
                    }
                    break;
            }
        });
    } catch (err) {
        logger.error(`Failed to open data migrate webview`);
        logger.debug(err);
        vscode.window.showErrorMessage(
            "Failed to open data migrate webview: " + err
        );
    }

    currentPanel.onDidDispose(() => {
        Memory.state.update(Constants.DATA_MIGRATE_DYNAMODB_WEBVIEW, null);
    });
};


async function listTables(region: string, awsAccessKeyId: string, awsSecretAccessKey: string): Promise<{ tables: string[], error: string | null }> {
    const ddb = new DynamoDBClient({
        region,
        credentials: {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey
        }
    });
    try {
        return await listTablesFromClient(ddb);
    } finally {
        ddb.destroy();
    }
}

async function listTablesByProfile(region: string, profile: string): Promise<{ tables: string[], error: string | null }> {
    const ddb = new DynamoDBClient({
        region,
        credentials: fromIni({ profile })
    });
    try {
        return await listTablesFromClient(ddb);
    } finally {
        ddb.destroy();
    }
}

async function listProfiles(): Promise<Set<string>> {
    const credentialsPath = join(process.env.HOME || "", ".aws", "credentials");
    try {
        const content = await readFile(credentialsPath, { encoding: "utf-8" });
        const profiles = new Set<string>();
        const regex = /^\[([\w-]+)\]/gm;
        let match;
        while (match = regex.exec(content)) {
            profiles.add(match[1]);
        }
        return profiles;
    } catch (error) {
        console.error("Error reading profiles:", error);
        return new Set<string>();
    }
}

async function listTablesFromClient(ddb: DynamoDBClient): Promise<{ tables: string[], error: string | null }> {
    try {
        const command = new ListTablesCommand({});
        const response: ListTablesCommandOutput = await ddb.send(command);
        return { tables: response.TableNames || [], error: null };
    } catch (err) {
        return { tables: [], error: "There was an error connecting to the DynamoDB instance." };;
    }

}

