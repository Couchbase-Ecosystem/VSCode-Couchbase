import * as vscode from 'vscode';
import { getActiveConnection } from '../../../util/connections';
import UntitledSqlppDocumentService from './controller';
import { WorkbenchWebviewProvider } from '../../../workbench/workbenchWebviewProvider';
import { CouchbaseError, QueryOptions, QueryProfileMode, QueryStatus } from "couchbase";
import { ISearchQueryContext } from '../../../types/ISearchQueryContext';
import { CouchbaseRestAPI } from '../../../util/apis/CouchbaseRestAPI';
import { MemFS } from "../../../util/fileSystemProvider";
import UntitledSearchJsonDocumentService from './controller';
import SearchIndexNode from '../../../model/SearchIndexNode';

export class SearchWorkbench {
    private _untitledSearchJsonDocumentService: UntitledSearchJsonDocumentService;
    public editorToContext: Map<string, ISearchQueryContext>;

    constructor() {
        this._untitledSearchJsonDocumentService =
            new UntitledSearchJsonDocumentService();
        this.editorToContext = new Map<string, ISearchQueryContext>();
    }


    runCouchbaseSearchQuery = async (
        workbenchWebviewProvider: WorkbenchWebviewProvider
    ) => {
        const connection = getActiveConnection();
        if (!connection) {
            vscode.window.showInformationMessage(
                "Kindly establish a connection with the cluster before running an index query."
            );
            return false;
        }

        // Get the active text editor
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor && activeTextEditor.document.languageId === "searchQuery") {

            activeTextEditor.document.save();
            const indexQueryPayload = activeTextEditor.selection.isEmpty ? activeTextEditor.document.getText() : activeTextEditor.document.getText(activeTextEditor.selection);
            const queryContext = this.editorToContext.get(activeTextEditor.document.uri.toString());

            try {
                // Reveal the webview when the extension is activated
                vscode.commands.executeCommand('workbench.view.extension.couchbase-workbench-panel');
                vscode.commands.executeCommand("workbench.action.focusPanel");
                await new Promise((resolve) => setTimeout(resolve, 500));
                await workbenchWebviewProvider.sendQueryResult(JSON.stringify([{ "status": "Executing statement" }]), { queryStatus: QueryStatus.Running }, null);
                const explainPlan = JSON.stringify("");
                const couchbbaseRestAPI = new CouchbaseRestAPI(connection);
                if (queryContext?.indexName){

                }
                const searchQueryResult = await couchbbaseRestAPI.runSearchIndexes(queryContext?.indexName, indexQueryPayload);
                workbenchWebviewProvider.setSearchQueryResult(
                    JSON.stringify(searchQueryResult?.hits),
                    {},
                    explainPlan
                );
            } catch (err) {
                const errorArray = [];
                if (err instanceof CouchbaseError) {
                    const { first_error_code, first_error_message, statement } =
                        err.cause as any;
                    if (
                        first_error_code !== undefined ||
                        first_error_message !== undefined ||
                        statement !== undefined
                    ) {
                        errorArray.push({
                            code: first_error_code,
                            msg: first_error_message,
                            query: statement,
                        });
                    } else {
                        errorArray.push(err);
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
                    null
                );
            }
            
        }
        
    }
    openSearchWorkbench(searchIndexNode: SearchIndexNode, memFs: MemFS) {
        try {
            return this._untitledSearchJsonDocumentService.newQuery(searchIndexNode, memFs);
        } catch (error) {
            console.log("Error in openSearchWorkbench:", error);
            throw error; 
        }
    }
    

}