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
import { CouchbaseError } from 'couchbase';

/**
 * // This is a typescript class for creating and handling the execution of a new Couchbase Query Notebook,
 * which has an executeAll method that executes all cells in a query notebook when called. 
 * It also has a doExecution method which handles the individual execution of each cell, 
 * including managing the creation of the notebook cell execution and replacing the output 
 * with the result or error messages depending on the execution's state.
 */
export class QueryKernel {
    // Private properties to set an ID, label and the types of languages it supports
    private readonly _id = 'couchbase-query-notebook-kernel';
    private readonly _label = 'New Couchbase Query Notebook';
    private readonly _supportedLanguages = ['SQL++', 'json'];

    private _executionOrder = 0;
    private readonly _controller: vscode.NotebookController;

    // Constructor used to create new QueryKernel objects
    constructor() {
        this._controller = vscode.notebooks.createNotebookController(
            this._id,
            'couchbase-query-notebook',
            this._label
        );
        this._controller.supportedLanguages = this._supportedLanguages;
        this._controller.supportsExecutionOrder = true;
        this._controller.executeHandler = this._executeAll.bind(this);
    }

    // Method to release any resources being held, currently it just disposes the notebook controller
    dispose(): void { this._controller.dispose(); }

    // This is the main method to execute all cells' queries. It will be called by the internal VBox office code when a user requests to execute all the content of this kernel.
    private _executeAll(cells: vscode.NotebookCell[], _notebook: vscode.NotebookDocument, _controller: vscode.NotebookController): void {
        for (const cell of cells) {
            this._doExecution(cell);
        }
    }

    //The core function that executes query from each individual notebook cell
    private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
        const execution = this._controller.createNotebookCellExecution(cell);
        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());

        try {
            const activeConnection = getActiveConnection();
            if (!activeConnection) {
                vscode.window.showErrorMessage("Connection Failure: Looks like you are not connected to cluster \nPlease check your cluster connection and try again", { modal: true });
                throw Error('Connection Failed');
            };
            const result = await activeConnection.cluster?.query(
                cell.document.getText()
            );
            execution.replaceOutput([new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.json(result?.rows)
            ])]);

            execution.end(true, Date.now());
        } catch (err) {
            const errorArray = [];
            if (err instanceof CouchbaseError) {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                const { first_error_code, first_error_message, statement } = err.cause as any;
                if (first_error_code !== undefined || first_error_message !== undefined || statement !== undefined) {
                    errorArray.push({
                        code: first_error_code,
                        msg: first_error_message,
                        query: statement,
                    });
                } else {
                    errorArray.push(err);
                }
            }
            else {
                errorArray.push(err);
            }
            execution.replaceOutput([new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.json(errorArray)
            ])]);
        }
        execution.end(false, Date.now());
    }
}
