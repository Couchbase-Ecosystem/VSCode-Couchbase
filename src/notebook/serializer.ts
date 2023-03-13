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
