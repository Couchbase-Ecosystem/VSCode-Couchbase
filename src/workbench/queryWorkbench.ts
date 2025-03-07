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
import { getUUID, Memory } from '../util/util';
import { QueryHistoryTreeProvider } from '../tree/QueryHistoryTreeProvider';
import { IQueryContext } from '../types/IQueryContext';
import { getAllNamedParameters } from '../util/namedParameters';
import { stripComments } from '../util/workbench/stripComments';

export class QueryWorkbench {
    private _untitledSqlppDocumentService: UntitledSqlppDocumentService;
    public editorToContext: Map<string, IQueryContext>;

    constructor() {
        this._untitledSqlppDocumentService = new UntitledSqlppDocumentService();
        this.editorToContext = new Map<string, IQueryContext>();
    }

    separateQueries = (batchQuery: string) => {
        const queries = [];
        let curQuery = '';

        // AV-90844 - need to remove comments before splitting, but then restore them after
        const SQL_COMMENT_REGEXP = /--.*$\n?|\/\*[\s\S]*?\*\/|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/gm;
        const comments: string[] = [];
        let queryNoComments = batchQuery;
        queryNoComments = queryNoComments.replace(SQL_COMMENT_REGEXP, (match) => {
            comments.push(match);
            return '^&&^';
        });

        // split the query with no comments
        const findSemicolons = // regex copied from on-prem UI, a parser would be better!
            /("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(\/\*(?:.|[\n\r])*\*\/)|(`(?:[^`]|``)*`)|((?:[^;"'`/]|\/(?!\*))+)|(;)/g;
        let matchArray = findSemicolons.exec(queryNoComments);

        while (matchArray !== null) {
            curQuery += matchArray[0];

            if (matchArray[0] === ';') {
                queries.push(curQuery);
                curQuery = '';
            }

            matchArray = findSemicolons.exec(queryNoComments);
        }

        if (curQuery.length > 0) {
            queries.push(curQuery); // get final query if unterminated with ;
        }

        // restore comments
        for (let index = 0; index < queries.length; index++) {
            while (/\^&&\^/gi.exec(queries[index])) {
                if (!comments.length) {
                    break;
                }
                queries[index] = queries[index].replace(/\^&&\^/gi, () => {
                    return comments.shift() || '';
                });
            }
            // if a query has nothing but comments, remove it
            if (stripComments(queries[index]).trim().length === 0) {
                queries.splice(index, 1);
                index--;
            }
        }

        return queries;
    };

    runMultipleQueries = async ({ separatedQueries, queryOptions }: { separatedQueries: string[], queryOptions: QueryOptions }) => {
        let queryResponses: { batchQuery: string; batchQueryResult: unknown }[] = [];
        let status = 'success';
        const connection = getActiveConnection();
        console.log('separated Queries', separatedQueries);

        for (const separatedQuery of separatedQueries) {
            console.log('separatedQuery 1', separatedQuery);
            try {
                const response = await connection?.cluster?.query(separatedQuery, queryOptions).then(
                    (response: any) => response,
                    (error: any) => (typeof error === 'object' && 'response' in error ? error.response : {
                        meta: {
                            status: "fatal"
                        }
                    })
                );
                if (separatedQuery.includes('CREATE SCOPE') || separatedQuery.includes('CREATE COLLECTION')) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
                queryResponses = [...queryResponses, { batchQuery: separatedQuery, batchQueryResult: response?.rows || 'No results' }];

                // stop executing batch queries if one of them failed
                if (response.meta.status !== 'success') {
                    break;
                }
            } catch (error: any) {
                queryResponses = [
                    {
                        batchQuery: separatedQuery,
                        batchQueryResult: error?.response?.errors || 'Unknown error',
                    },
                ];
                status = 'error';
                return { rows: queryResponses, busy: false, status };
            }
        }

        return { rows: queryResponses, busy: false, status };
    };


    runCouchbaseQuery = async (
        workbenchWebviewProvider: WorkbenchWebviewProvider,
        queryHistoryTreeProvider: QueryHistoryTreeProvider,
        isExplainQuery: boolean
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
            let query = activeTextEditor.selection.isEmpty ? activeTextEditor.document.getText() : activeTextEditor.document.getText(activeTextEditor.selection);
            if (isExplainQuery) {
                // Construct Explain Query
                query = "EXPLAIN " + query;
            }
            const queryContext = this.editorToContext.get(activeTextEditor.document.uri.toString());
            const queryContextString = queryContext && (`${queryContext?.bucketName}.${queryContext?.scopeName}`); // Query context string is of format bucketName.ScopeName
            const queryParameters = getAllNamedParameters();

            const queryOptions: QueryOptions = {
                profile: QueryProfileMode.Timings,
                metrics: true,
                queryContext: queryContextString,
                parameters: queryParameters,
                timeout: Memory.state.get("queryTimeout") || 600,
            };
            try {
                // Reveal the webview when the extension is activated
                vscode.commands.executeCommand('workbench.view.extension.couchbase-workbench-panel');
                vscode.commands.executeCommand("workbench.action.focusPanel");
                await new Promise((resolve) => setTimeout(resolve, 500));
                await workbenchWebviewProvider.sendQueryResult(JSON.stringify([{ "status": "Executing statement" }]), { queryStatus: QueryStatus.Running }, null);
                const start = Date.now();

                const separatedQueries = this.separateQueries(query);
                let result;
                let queryStatusProps = {};
                let explainPlan = null;
                let timeWait = 0;
                if (separatedQueries.length > 1) {
                    result = await this.runMultipleQueries({ separatedQueries, queryOptions });
                    queryStatusProps = {
                        queryStatus: result?.status,
                    };
                } else {
                    result = await connection.cluster?.query(query, queryOptions);
                    const end = Date.now();
                    const rtt = end - start;
                    const resultSize = result?.meta.metrics?.resultSize;
                    queryStatusProps = {
                        queryStatus: result?.meta.status,
                        rtt: rtt.toString() + " MS",
                        elapsed: result?.meta.metrics?.elapsedTime.toString() + " MS",
                        executionTime: result?.meta.metrics?.executionTime + " MS",
                        numDocs: result?.meta.metrics?.resultCount.toString() + " docs",
                        size: resultSize ? (resultSize > 1000 ? (resultSize / 1000).toFixed(2) + " KB" : resultSize + " Bytes") : ""
                    };
                    explainPlan = JSON.stringify(result?.meta.profile?.executionTimings);
                    timeWait = result?.meta.metrics?.resultSize || 0;
                }
                workbenchWebviewProvider.setQueryResult(
                    JSON.stringify(result?.rows),
                    queryStatusProps,
                    explainPlan,
                    false
                );
                await saveQuery({ query: query, id: getUUID() });
                queryHistoryTreeProvider.refresh();

                await new Promise((resolve) => {
                    setTimeout(resolve, (timeWait / 10000));
                });
            } catch (err) {
                const errorArray = [];
                if (err instanceof CouchbaseError) {
                    const { first_error_code, first_error_message, statement } =
                        err.cause as any;
                    if (err.message === "ambiguous timeout") {
                        errorArray.push({
                            code: 1080,
                            msg: `Query Timeout: Timeout ${Memory.state.get('queryTimeout')}s exceeded`,
                            query: query,
                        });
                    } else if (
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
                    null,
                    false
                );
            }
        }
    };

    openWorkbench(memFs: MemFS) {
        this._untitledSqlppDocumentService.newQuery(memFs);
    }
}
