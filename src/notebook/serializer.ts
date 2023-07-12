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
import { TextDecoder, TextEncoder } from 'util';

interface RawNotebookData {
    cells: RawNotebookCell[]
}

interface RawNotebookCell {
    language: string;
    value: string;
    kind: vscode.NotebookCellKind;
    editable?: boolean;
}

/**
 * Serializes and Deserializes the content of a notebook. 
 * It reads raw/unprocessed file contents, parse it to JavaScript Object Notation (JSON) format,
 *  creates an array of Notebook cells, maps data into the desired format and then converts
 *  it back to a binary format using text encoding/decoding algorithms.
 */
export class QueryContentSerializer implements vscode.NotebookSerializer {
    public readonly label: string = 'New Query Notebook Serializer';

    public async deserializeNotebook(data: Uint8Array, token: vscode.CancellationToken): Promise<vscode.NotebookData> {
        const contents = new TextDecoder().decode(data); // convert to String

        // Read file contents
        let raw: RawNotebookData;
        try {
            raw = <RawNotebookData>JSON.parse(contents);
        } catch {
            raw = { cells: [] };
        }

        // Create array of Notebook cells for the VS Code API from file contents
        const cells = raw.cells.map(item => new vscode.NotebookCellData(
            item.kind,
            item.value,
            item.language
        ));

        return new vscode.NotebookData(cells);
    }

    public async serializeNotebook(data: vscode.NotebookData, token: vscode.CancellationToken): Promise<Uint8Array> {
        // Map the Notebook data into the format we want to save the Notebook data as
        const contents: RawNotebookData = { cells: [] };

        for (const cell of data.cells) {
            contents.cells.push({
                kind: cell.kind,
                language: cell.languageId,
                value: cell.value
            });
        }

        return new TextEncoder().encode(JSON.stringify(contents));
    }
}
