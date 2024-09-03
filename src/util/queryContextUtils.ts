import * as vscode from 'vscode';
import { QueryWorkbench } from '../workbench/queryWorkbench';
import { Memory } from './util';
import { Constants } from './constants';
import { Commands } from '../commands/extensionCommands/commands';
import { SearchWorkbench } from '../commands/fts/SearchWorkbench/searchWorkbench';
import SearchIndexNode from '../model/SearchIndexNode';
import { QueryKernel } from '../notebook/controller';

export const showQueryContextStatusbar = async (editor: vscode.TextEditor, workbench: QueryWorkbench, globalStatusBarItem: vscode.StatusBarItem) => {
    let queryContext = workbench.editorToContext.get(editor.document.uri.toString());
    if (!queryContext) {
        globalStatusBarItem.text = `$(group-by-ref-type) No Query Context Set`;
    } else {
        let bucketName = queryContext.bucketName;
        if (bucketName.length > 15) {
            bucketName = `${bucketName.substring(0, 13)}...`;
        }
        let scopeName = queryContext.scopeName;
        if (scopeName.length > 15) {
            scopeName = `${scopeName.substring(0, 13)}...`;
        }
        globalStatusBarItem.text = `$(group-by-ref-type) ${bucketName} > ${scopeName}`;
    }
    globalStatusBarItem.command = Commands.queryContext;
    globalStatusBarItem.tooltip = "Query Context";
    globalStatusBarItem.show();
};

export const showQueryContextStatusbarNotebook = async (editor: vscode.NotebookEditor, queryKernel: QueryKernel, globalStatusBarItem: vscode.StatusBarItem) => {
    const notebookUri = editor.notebook.uri.toString();
    const queryContext = queryKernel.notebookToContext.get(notebookUri);
    if (!queryContext) {
        globalStatusBarItem.text = `$(group-by-ref-type) No Query Context Set`;
    } else {
        let bucketName = queryContext.bucketName;
        if (bucketName.length > 15) {
            bucketName = `${bucketName.substring(0, 13)}...`;
        }
        let scopeName = queryContext.scopeName;
        if (scopeName.length > 15) {
            scopeName = `${scopeName.substring(0, 13)}...`;
        }
        globalStatusBarItem.text = `$(group-by-ref-type) ${bucketName} > ${scopeName}`;
    }
    globalStatusBarItem.command = Commands.queryContext;
    globalStatusBarItem.tooltip = "Query Context";
    globalStatusBarItem.show();
};


export const showSearchContextStatusbar = async (editor: vscode.TextEditor, searchNode: SearchIndexNode, workbench: SearchWorkbench, globalStatusBarItem: vscode.StatusBarItem) => {
    let editorId = editor.document.uri.toString();
    let editorContext = workbench.editorToContext.get(editorId);

    // Hide all other status bar items if present
    workbench.editorToContext.forEach((context, key) => {
        if (key !== editorId && context.statusBarItem) {
            context.statusBarItem.hide();
        }
    });
    if (!editorContext) {
        editorContext = {
            bucketName: searchNode.bucketName,
            indexName: searchNode.indexName,
            statusBarItem: globalStatusBarItem,
            searchNode: searchNode
        };
        workbench.editorToContext.set(editorId, editorContext);
    }
 
    const contextSearchNode = editorContext;

    let displayBucketName = contextSearchNode.bucketName ?? "";  
    let displayIndexName = contextSearchNode.indexName ?? "";   

    displayBucketName = displayBucketName.length > 15 ? `${displayBucketName.substring(0, 13)}...` : displayBucketName;
    displayIndexName = displayIndexName.length > 15 ? `${displayIndexName.substring(0, 13)}...` : displayIndexName;
    editorContext.statusBarItem.text = `$(group-by-ref-type) ${displayBucketName} > ${displayIndexName}`;
    if (displayBucketName === "" || displayIndexName === ""){
        editorContext.statusBarItem.text = `$(group-by-ref-type) No Search Query Context Set`;
    }
    editorContext.statusBarItem.tooltip = "Search Query Context";
    editorContext.statusBarItem.command = Commands.searchContext;


    editorContext.statusBarItem.show();
};


