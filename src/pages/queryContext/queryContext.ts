import { IConnection } from "../../types/IConnection";
import { Memory } from "../../util/util";
import * as vscode from "vscode";
import { logger } from "../../logger/logger";
import { Bucket, BucketSettings } from "couchbase";
import { QueryWorkbench } from "../../workbench/queryWorkbench";
import {
    showQueryContextStatusbar,
    showSearchContextStatusbar,
} from "../../util/queryContextUtils";
import { getActiveConnection } from "../../util/connections";
import { SearchWorkbench } from "../../commands/fts/SearchWorkbench/searchWorkbench";
import SearchIndexNode from "../../model/SearchIndexNode";
import { Commands } from "../../commands/extensionCommands/commands";

const fetchBucketNames = (
    bucketsSettings: BucketSettings[] | undefined,
    connection: IConnection,
): Array<Bucket> => {
    const allBuckets: Array<Bucket> = [];
    if (bucketsSettings !== undefined) {
        for (let bucketSettings of bucketsSettings) {
            const bucketName: string = bucketSettings.name;
            const bucket: Bucket | undefined =
                connection?.cluster?.bucket(bucketName);
            if (bucket !== undefined) {
                allBuckets.push(bucket);
            }
        }
    }
    return allBuckets;
};

export async function fetchQueryContext(
    workbench: QueryWorkbench,
    context: vscode.ExtensionContext,
    globalStatusBarItem: any,
) {
    const connection = getActiveConnection();

    if (!connection) {
        vscode.window.showErrorMessage(
            "Please connect to a cluster before setting query context",
        );
        return;
    }
    try {
        // Fetch active editor
        const activeEditor = vscode.window.activeTextEditor;
        if (!(activeEditor && activeEditor.document.languageId === "SQL++")) {
            vscode.window.showErrorMessage(
                "Please ensure that the workbench is open/active",
            );
            return;
        }

        // Fetch all buckets
        const bucketsSettings = await connection?.cluster
            ?.buckets()
            .getAllBuckets();
        const allBuckets = fetchBucketNames(bucketsSettings, connection);

        if (!allBuckets || allBuckets.length === 0) {
            vscode.window.showErrorMessage("No buckets found.");
            return;
        }

        const bucketItems = allBuckets.map((bucket: Bucket) => {
            return {
                label: bucket.name,
                iconPath: new vscode.ThemeIcon("database"),
            };
        });
        const selectedItem = await vscode.window.showQuickPick(
            [
                {
                    label: "Clears any active query context",
                    kind: vscode.QuickPickItemKind.Separator,
                },
                {
                    label: "Clear Context",
                    iconPath: new vscode.ThemeIcon("clear-all"),
                },
                { kind: vscode.QuickPickItemKind.Separator, label: "Buckets" },
                ...bucketItems,
            ],
            {
                canPickMany: false,
                placeHolder: "Query Context: Select a bucket",
            },
        );
        if (!selectedItem) {
            vscode.window.showInformationMessage("No buckets selected.");
            return;
        }

        const bucketNameSelected = selectedItem.label;
        if (bucketNameSelected === "Clear Context") {
            workbench.editorToContext.delete(
                activeEditor.document.uri.toString(),
            );
            showQueryContextStatusbar(
                activeEditor,
                workbench,
                globalStatusBarItem,
            );
            return;
        }
        const scopes = await connection.cluster
            ?.bucket(bucketNameSelected)
            .collections()
            .getAllScopes();
        if (scopes === undefined || scopes.length === 0) {
            vscode.window.showErrorMessage("No scopes found.");
            return;
        }

        const scopeNameSelected = await vscode.window.showQuickPick(
            scopes.map((scope) => {
                return {
                    label: scope.name,
                    iconPath: new vscode.ThemeIcon("file-submodule"),
                };
            }),
            { placeHolder: "Query Context: Select a scope" },
        );
        if (!scopeNameSelected) {
            vscode.window.showInformationMessage("No scope selected.");
            return;
        }
        workbench.editorToContext.set(activeEditor.document.uri.toString(), {
            bucketName: bucketNameSelected,
            scopeName: scopeNameSelected.label,
        });
        showQueryContextStatusbar(activeEditor, workbench, globalStatusBarItem);
    } catch (err) {
        logger.error(`failed to open and set query context: ${err}`);
        logger.debug(err);
    }
}

export async function fetchSearchContext(
    searchIndexNode: SearchIndexNode,
    workbench: SearchWorkbench,
    context: vscode.ExtensionContext,
    globalStatusBarItem: vscode.StatusBarItem,
) {
    const connection = getActiveConnection();
    if (!connection) {
        vscode.window.showErrorMessage(
            "Please connect to a cluster before setting query context",
        );
        return;
    }
    try {
        const activeEditor = vscode.window.activeTextEditor;
        if (
            !(
                activeEditor &&
                activeEditor.document.languageId === "json" &&
                activeEditor.document.fileName.endsWith(".cbs.json")
            )
        ) {
            vscode.window.showErrorMessage(
                "Please ensure that the workbench is open/active",
            );
            return;
        }

        // Fetching bucket names
        const bucketsSettings = await connection?.cluster
            ?.buckets()
            .getAllBuckets();
        const allBuckets = fetchBucketNames(bucketsSettings, connection);
        if (!allBuckets || allBuckets.length === 0) {
            vscode.window.showErrorMessage("No buckets found.");
            return;
        }

        // Displaying QuickPick for buckets
        const selectedItem = await vscode.window.showQuickPick(
            allBuckets.map((bucket) => ({
                label: bucket.name,
                iconPath: new vscode.ThemeIcon("database"),
            })),
            {
                placeHolder: "Search Query Context: Select a bucket",
                canPickMany: false,
            },
        );

        if (!selectedItem) {
            vscode.window.showInformationMessage("No buckets selected.");
            return;
        }

        let bucketNameSelected = selectedItem.label;

        // Fetching search indexes specific to the selected bucket
        const searchIndexesManager = connection?.cluster?.searchIndexes();
        const ftsIndexes = await searchIndexesManager?.getAllIndexes();
        const bucketIndexes = ftsIndexes?.filter(
            (index) => index.sourceName === bucketNameSelected,
        );
        if (!bucketIndexes || bucketIndexes.length === 0) {
            vscode.window.showErrorMessage("No Indexes found.");
            return;
        }

        // Displaying QuickPick for indexes
        const indexNameSelected = await vscode.window.showQuickPick(
            bucketIndexes.map((index) => ({
                label: index.name,
                iconPath: new vscode.ThemeIcon("file-submodule"),
            })),
            {
                placeHolder: "Query Context: Select an Index",
                canPickMany: false,
            },
        );

        if (!indexNameSelected) {
            vscode.window.showInformationMessage("No index selected.");
            return;
        }

        let editorId = activeEditor.document.uri.toString();
        let editorContext = workbench.editorToContext.get(editorId);

        let displayBucketName =
            bucketNameSelected.length > 15
                ? `${bucketNameSelected.substring(0, 13)}...`
                : bucketNameSelected;
        let displayIndexName =
            indexNameSelected.label.length > 15
                ? `${indexNameSelected.label.substring(0, 13)}...`
                : indexNameSelected.label;

        editorContext = {
            bucketName: bucketNameSelected,
            indexName: indexNameSelected.label,
            statusBarItem: globalStatusBarItem,
            searchNode: searchIndexNode,
        };
        workbench.editorToContext.set(editorId, editorContext);
        editorContext.statusBarItem.text = `$(group-by-ref-type) ${displayBucketName} > ${displayIndexName}`;
        editorContext.statusBarItem.tooltip = "Search Query Context";
        editorContext.statusBarItem.command = Commands.searchContext;
    } catch (err) {
        logger.error(`Failed to open and set query context: ${err}`);
        logger.debug(err);
    }
}
