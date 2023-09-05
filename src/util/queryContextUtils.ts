import * as vscode from 'vscode';
import { QueryWorkbench } from '../workbench/queryWorkbench';
import { Memory } from './util';

export const showQueryContextStatusbar = async (editor: vscode.TextEditor, workbench: QueryWorkbench) => {
    let statusBarItem = Memory.state.get<vscode.StatusBarItem>("queryContextStatusBar");
    if(!statusBarItem){
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
        Memory.state.update("queryContextStatusBar",statusBarItem);
    }
    let queryContext = workbench.editorToContext.get(editor.document.uri.toString());
    if(!queryContext) {
        statusBarItem.text = "$(group-by-ref-type) No Query Context Set";
    } else {
        let bucketName = queryContext.bucketName;
        if (bucketName.length > 15) {
            bucketName = bucketName.substring(0,15)+'...';
        }
        let scopeName = queryContext.scopeName;
        if(scopeName.length > 15){
            scopeName = scopeName.substring(0,15)+'...';
        }
        statusBarItem.text = "$(group-by-ref-type) " + bucketName + " > " + scopeName;
    }
    statusBarItem.command = "vscode-couchbase.queryContext";
    statusBarItem.tooltip = "Query Context";
    statusBarItem.show();
};

export const hideQueryContextStatusbar = async() => {
    let statusBarItem = Memory.state.get<vscode.StatusBarItem>("queryContextStatusBar");
    if(!statusBarItem){
        return;
    }
    statusBarItem.hide();
};
