import * as vscode from "vscode";
import { getActiveConnection } from "../../../util/connections";
import { WorkbenchWebviewProvider } from "../../../workbench/workbenchWebviewProvider";
import { QueryStatus } from "couchbase";
import { ISearchQueryContext } from "../../../types/ISearchQueryContext";
import { CouchbaseRestAPI } from "../../../util/apis/CouchbaseRestAPI";
import { MemFS } from "../../../util/fileSystemProvider";
import UntitledSearchJsonDocumentService from "./controller";
import SearchIndexNode from "../../../model/SearchIndexNode";
import { logger } from "../../../logger/logger";

export class SearchWorkbench {
    private _untitledSearchJsonDocumentService: UntitledSearchJsonDocumentService;
    public editorToContext: Map<string, ISearchQueryContext>;

    constructor() {
        this._untitledSearchJsonDocumentService =
            new UntitledSearchJsonDocumentService();
        this.editorToContext = new Map<string, ISearchQueryContext>();
    }

    runCouchbaseSearchQuery = async (
        workbenchWebviewProvider: WorkbenchWebviewProvider,
    ) => {
        const connection = getActiveConnection();
        if (!connection) {
            vscode.window.showInformationMessage(
                "Kindly establish a connection with the cluster before running an index query.",
            );
            return false;
        }

        // Get the active text editor
        const activeTextEditor = vscode.window.activeTextEditor;
        if (
            activeTextEditor &&
            activeTextEditor.document.languageId === "json" &&
            activeTextEditor.document.fileName.endsWith(".cbs.json")
        ) {
            try {
                JSON.parse(activeTextEditor.document.getText());
            } catch (err) {
                // Invalid JSON case
                let errorArray = [];
                errorArray.push({
                    code: 0,
                    msg: "The query is not a valid JSON",
                    query: false,
                });
                const queryStatusProps = {
                    queryStatus: QueryStatus.Fatal,
                    rtt: "-",
                    elapsed: "-",
                    executionTime: "-",
                    numDocs: "-",
                    size: "-",
                };
                workbenchWebviewProvider.setQueryResult(
                    JSON.stringify(errorArray),
                    queryStatusProps,
                    null,
                    true,
                );
                return;
            }

            activeTextEditor.document.save();
            const indexQueryPayload = activeTextEditor.selection.isEmpty
                ? activeTextEditor.document.getText()
                : activeTextEditor.document.getText(activeTextEditor.selection);
            const queryContext = this.editorToContext.get(
                activeTextEditor.document.uri.toString(),
            );

            try {
                // Reveal the webview when the extension is activated
                vscode.commands.executeCommand(
                    "workbench.view.extension.couchbase-workbench-panel",
                );
                vscode.commands.executeCommand("workbench.action.focusPanel");
                await new Promise((resolve) => setTimeout(resolve, 500));
                await workbenchWebviewProvider.sendQueryResult(
                    JSON.stringify([{ status: "Executing statement" }]),
                    { queryStatus: QueryStatus.Running },
                    null,
                );
                const explainPlan = JSON.stringify("");
                const couchbbaseRestAPI = new CouchbaseRestAPI(connection);
                const searchIndexesManager =
                    connection?.cluster?.searchIndexes();
                const ftsIndexes = await searchIndexesManager?.getAllIndexes();
                const bucketIndexes = ftsIndexes?.filter(
                    (index) => index.name === queryContext?.indexName,
                );
                if (bucketIndexes?.length == 0) {
                    // Index was deleted/ Not found
                    let editorId = activeTextEditor.document.uri.toString();
                    let editorContext = this.editorToContext.get(editorId);
                    if (editorContext) {
                        editorContext.statusBarItem.text = `$(group-by-ref-type) No Search Query Context Set`;
                        throw new Error("Search Index not found");
                    }
                }
                const start = Date.now();
                const searchQueryResult =
                    await couchbbaseRestAPI.runSearchIndexes(
                        queryContext?.indexName,
                        indexQueryPayload,
                    );
                const end = Date.now();
                const rtt = end - start;
                const resultJson = JSON.stringify(searchQueryResult);
                const resultSize = new TextEncoder().encode(resultJson).length;
                const queryStatusProps = {
                    queryStatus:
                        searchQueryResult?.status.successful === 1
                            ? "success"
                            : "fatal",
                    rtt: rtt.toString() + " MS",
                    elapsed:
                        (searchQueryResult?.took / 1000).toString() + " MS",
                    numDocs: searchQueryResult?.total_hits.toString() + " docs",
                    size: resultSize
                        ? resultSize > 1000
                            ? (resultSize / 1000).toFixed(2) + " KB"
                            : resultSize + " Bytes"
                        : "",
                };
                workbenchWebviewProvider.setQueryResult(
                    JSON.stringify(searchQueryResult?.hits),
                    queryStatusProps,
                    explainPlan,
                    true,
                );
            } catch (err: any) {
                const errorArray = [];
                if (err.response && err.response.data) {
                    if (err.response.status === 400) {
                        errorArray.push({
                            code: err.response.status,
                            msg: err.response.data.error || "Bad request",
                            query:
                                err.config && err.config.url
                                    ? err.config.url
                                    : "No URL",
                        });
                    } else {
                        errorArray.push({
                            code: err.response.status,
                            msg: err.message,
                            query: err.config && err.config.url,
                        });
                    }
                } else {
                    errorArray.push(err);
                }
                const queryStatusProps = {
                    queryStatus: QueryStatus.Fatal,
                    rtt: "-",
                    elapsed: "-",
                    executionTime: "-",
                    numDocs: "-",
                    size: "-",
                };
                workbenchWebviewProvider.setQueryResult(
                    JSON.stringify(errorArray),
                    queryStatusProps,
                    null,
                    true,
                );
            }
        }
    };
    openSearchWorkbench(searchIndexNode: SearchIndexNode, memFs: MemFS) {
        try {
            return this._untitledSearchJsonDocumentService.newQuery(
                searchIndexNode,
                memFs,
            );
        } catch (error) {
            logger.error("Error while opening Search WorkBench:" + error);
            throw error;
        }
    }
}
