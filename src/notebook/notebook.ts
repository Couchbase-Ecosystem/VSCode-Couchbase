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
