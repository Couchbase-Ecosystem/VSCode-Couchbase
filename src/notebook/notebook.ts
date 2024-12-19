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
import { Constants } from '../util/constants';

/**
 * This code exports a createNotebook function that creates a new notebook in VS Code's UI with an empty SQL++ cell. 
 */
export const createNotebook = async () => {
    const language = 'SQL++';
    const defaultValue = ``;
    const cell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code, defaultValue, language);
    const data = new vscode.NotebookData([cell]);
    data.metadata = {
        custom: {
            cells: [],
            metadata: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                orig_nbformat: 4
            },
            nbformat: 4,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            nbformat_minor: 2
        }
    };
    const doc = await vscode.workspace.openNotebookDocument(Constants.notebookType, data);
    await vscode.window.showNotebookDocument(doc);
};
