import * as vscode from 'vscode';
import { QueryWorkbench } from '../workbench/queryWorkbench';
import { showQueryContextStatusbar, showQueryContextStatusbarNotebook } from '../util/queryContextUtils';
import { QueryKernel } from '../notebook/controller';

export async function handleQueryContextStatusbar(
    activeEditor: vscode.TextEditor | undefined,
    activeNotebookEditor: vscode.NotebookEditor | undefined,
    workbench: QueryWorkbench,
    queryKernel: QueryKernel,
    globalStatusBarItem: vscode.StatusBarItem
) {
    if (activeNotebookEditor) {

        showQueryContextStatusbarNotebook(activeNotebookEditor, queryKernel, globalStatusBarItem)

    } else if (activeEditor && activeEditor.document.languageId === "SQL++") {
        showQueryContextStatusbar(activeEditor, workbench, globalStatusBarItem)

    } else {
        globalStatusBarItem.hide();
    }
}