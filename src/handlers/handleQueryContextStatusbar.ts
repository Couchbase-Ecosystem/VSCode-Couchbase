import * as vscode from 'vscode';
import { QueryWorkbench } from '../workbench/queryWorkbench';
import { hideQueryContextStatusbar, showQueryContextStatusbar } from '../util/queryContextUtils';
export const handleQueryContextStatusbar = async (editor: vscode.TextEditor | undefined, workbench: QueryWorkbench) => {
    if( editor && editor.document.languageId === "SQL++"){
        // Case 1: Show Status bar
        showQueryContextStatusbar(editor, workbench);
    } else {
        // Case 2: Don't show status bar
        hideQueryContextStatusbar();
    }
};