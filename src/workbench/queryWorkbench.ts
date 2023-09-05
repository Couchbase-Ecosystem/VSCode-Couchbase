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
import { saveQuery } from '../util/queryHistory';
import { getUUID } from '../util/util';
import { QueryHistoryTreeProvider } from '../tree/QueryHistoryTreeProvider';
import { IQueryContext } from '../types/IQueryContext';

export class QueryWorkbench {
    private _untitledSqlppDocumentService: UntitledSqlppDocumentService;
    public editorToContext: Map<string, IQueryContext>;

    constructor() {
        this._untitledSqlppDocumentService = new UntitledSqlppDocumentService();
        this.editorToContext = new Map<string,IQueryContext>();
    }

    runCouchbaseQuery = async (workbenchWebviewProvider: WorkbenchWebviewProvider, queryHistoryTreeProvider: QueryHistoryTreeProvider) => {
        const connection = getActiveConnection();
        if (!connection) {
            vscode.window.showInformationMessage("Kindly establish a connection with the cluster before executing query.");
            return false;
        }
        // Get the active text editor
        const activeTextEditor = vscode.window.activeTextEditor;
        if (
            activeTextEditor &&
            activeTextEditor.document.languageId === "SQL++"
        ) {
            // Get the text content of the active text editor.
            const query = activeTextEditor.document.getText();
            const result = await connection.cluster?.query(query);
            workbenchWebviewProvider.setQueryResult(result);
            await saveQuery({query: query, id: getUUID()});
            queryHistoryTreeProvider.refresh();

        }
    };

    openWorkbench(memFs: MemFS) {
        this._untitledSqlppDocumentService.newQuery(memFs);
    };
}