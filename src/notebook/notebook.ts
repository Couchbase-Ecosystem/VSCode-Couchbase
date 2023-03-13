import * as vscode from 'vscode';
import { Constants } from '../util/constants';

export const createNotebook = async () => {
    const language = 'sql++';
    const defaultValue = ``;
    const cell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code, defaultValue, language);
    const data = new vscode.NotebookData([cell]);
    data.metadata = {
        custom: {
            cells: [],
            metadata: {
                orig_nbformat: 4
            },
            nbformat: 4,
            nbformat_minor: 2
        }
    };
    const doc = await vscode.workspace.openNotebookDocument(Constants.notebookType, data);
    await vscode.window.showNotebookDocument(doc);
};