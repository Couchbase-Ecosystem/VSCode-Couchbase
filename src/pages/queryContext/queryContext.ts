import { IConnection } from "../../types/IConnection";
import { Memory } from "../../util/util";
import * as vscode from 'vscode';
import { logger } from "../../logger/logger";
import { Bucket, BucketSettings } from "couchbase";
import { QueryWorkbench } from "../../workbench/queryWorkbench";
import { showQueryContextStatusbar } from "../../util/queryContextUtils";
import { Constants } from "../../util/constants";
import { getActiveConnection } from "../../util/connections";

const fetchBucketNames = (bucketsSettings: BucketSettings[] | undefined, connection: IConnection): Array<Bucket> => {
    let allBuckets: Array<Bucket> = [];
    if (bucketsSettings !== undefined) {
        for (let bucketSettings of bucketsSettings) {
            let bucketName: string = bucketSettings.name;
            let bucket: Bucket | undefined = connection?.cluster?.bucket(bucketName);
            if (bucket !== undefined) {
                allBuckets.push(bucket);
            }
        }
    }
    return allBuckets;
};

export async function fetchQueryContext(workbench: QueryWorkbench, context: vscode.ExtensionContext) {
    const connection = getActiveConnection();

    if (!connection) {
        vscode.window.showErrorMessage("Please connect to a cluster before setting query context");
        return;
    }
    try {
        // Fetch active editor
        let activeEditor = vscode.window.activeTextEditor;
        if (
            !(activeEditor &&
                activeEditor.document.languageId === "SQL++")
        ) {
            vscode.window.showErrorMessage("workbench is not active");
            return;
        }

        // Fetch all buckets
        let bucketsSettings = await connection?.cluster?.buckets().getAllBuckets();
        let allBuckets = fetchBucketNames(bucketsSettings, connection);

        if (!allBuckets || allBuckets.length === 0) {
            vscode.window.showErrorMessage('No buckets found.');
            return;
        }

        let bucketItems = allBuckets.map((bucket: Bucket) => { return { label: bucket.name, iconPath: new vscode.ThemeIcon("database") }; });
        let selectedItem = await vscode.window.showQuickPick([
            { label: "Clears any active query context", kind: vscode.QuickPickItemKind.Separator },
            { label: "Clear Context", iconPath: new vscode.ThemeIcon("clear-all") },
            { kind: vscode.QuickPickItemKind.Separator, label: "Buckets" },
            ...bucketItems
        ], {
            canPickMany: false,
            placeHolder: 'Query Context: Select a bucket',
        });
        if (!selectedItem) {
            vscode.window.showInformationMessage("No buckets selected.");
            return;
        }

        let bucketNameSelected = selectedItem.label;
        if (bucketNameSelected === 'Clear Context') {
            workbench.editorToContext.delete(activeEditor.document.uri.toString());
            showQueryContextStatusbar(activeEditor, workbench);
            return;
        }
        let scopes = await connection.cluster
            ?.bucket(bucketNameSelected)
            .collections()
            .getAllScopes();
        if (scopes === undefined || scopes.length === 0) {
            vscode.window.showErrorMessage('No scopes found.');
            return;
        }

        let scopeNameSelected = await vscode.window.showQuickPick(scopes.map((scope) => { return { label: scope.name, iconPath: new vscode.ThemeIcon("file-submodule") }; }), { placeHolder: 'Query Context: Select a scope' });
        if (!scopeNameSelected) {
            vscode.window.showInformationMessage('No scope selected.');
            return;
        }
        workbench.editorToContext.set(activeEditor.document.uri.toString(), {
            bucketName: bucketNameSelected,
            scopeName: scopeNameSelected.label
        });
        showQueryContextStatusbar(activeEditor, workbench);

    } catch (err) {
        logger.error(`failed to open and set query context: ${err}`);
        logger.debug(err);
    }
}