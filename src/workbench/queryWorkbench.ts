/*
 *     Copyright 2011-2020 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import * as vscode from 'vscode';
import { getActiveConnection } from '../util/connections';
import UntitledSqlppDocumentService from './controller';
import { WorkbenchWebviewProvider } from './workbenchWebviewProvider';
import { MemFS } from '../util/fileSystemProvider';
import { CouchbaseError, QueryOptions, QueryProfileMode, QueryStatus } from "couchbase";
import { saveQuery } from '../util/queryHistory';
import { getUUID } from '../util/util';
import { QueryHistoryTreeProvider } from '../tree/QueryHistoryTreeProvider';
import { IQueryContext } from '../types/IQueryContext';

export class QueryWorkbench {
    private _untitledSqlppDocumentService: UntitledSqlppDocumentService;
    public editorToContext: Map<string, IQueryContext>;

    constructor() {
        this._untitledSqlppDocumentService = new UntitledSqlppDocumentService();
        this.editorToContext = new Map<string, IQueryContext>();
    }

    runCouchbaseQuery = async (
        workbenchWebviewProvider: WorkbenchWebviewProvider,
        queryHistoryTreeProvider: QueryHistoryTreeProvider
    ) => {
        const connection = getActiveConnection();
        if (!connection) {
            vscode.window.showInformationMessage(
                "Kindly establish a connection with the cluster before executing query."
            );
            return false;
        }
        // Get the active text editor
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor && activeTextEditor.document.languageId === "SQL++") {
            // Get the text content of the active text editor.
            activeTextEditor.document.save();
            const query = activeTextEditor.selection.isEmpty ? activeTextEditor.document.getText() : activeTextEditor.document.getText(activeTextEditor.selection);
            const queryContext = this.editorToContext.get(activeTextEditor.document.uri.toString());
            const queryContextString = queryContext && (`${queryContext?.bucketName}.${queryContext?.scopeName}`); // Query context string is of format bucketName.ScopeName
            const queryOptions: QueryOptions = {
                profile: QueryProfileMode.Timings,
                metrics: true,
                queryContext: queryContextString,
                parameters: {
                    
                }
            };
            try {
                // Reveal the webview when the extension is activated
                vscode.commands.executeCommand('workbench.view.extension.couchbase-workbench-panel');
                vscode.commands.executeCommand("workbench.action.focusPanel");
                await new Promise((resolve) => setTimeout(resolve, 500));
                await workbenchWebviewProvider.sendQueryResult(JSON.stringify([{ "status": "Executing statement" }]), { queryStatus: QueryStatus.Running }, null);
                const start = Date.now();
                const result = await connection.cluster?.query(query, queryOptions);
                const end = Date.now();
                const rtt = end - start;
                const resultSize = result?.meta.metrics?.resultSize;
                const queryStatusProps = {
                    queryStatus: result?.meta.status,
                    rtt: rtt.toString() + " MS",
                    elapsed: result?.meta.metrics?.elapsedTime.toString() + " MS",
                    executionTime: result?.meta.metrics?.executionTime + " MS",
                    numDocs: result?.meta.metrics?.resultCount.toString() + " docs",
                    size: resultSize ? (resultSize > 1000 ? (resultSize / 1000).toFixed(2) + " KB" : resultSize + " Bytes") : ""
                };
                const explainPlan = JSON.stringify(result?.meta.profile.executionTimings);
                workbenchWebviewProvider.setQueryResult(
                    JSON.stringify(result?.rows),
                    queryStatusProps,
                    explainPlan
                );
                await saveQuery({ query: query, id: getUUID() });
                queryHistoryTreeProvider.refresh();
                let timeWait = result?.meta.metrics?.resultSize || 0;

                await new Promise((resolve) => {
                    setTimeout(resolve, (timeWait / 10000));
                });
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
    };

    openWorkbench(memFs: MemFS) {
        this._untitledSqlppDocumentService.newQuery(memFs);
    }
}
