import * as vscode from 'vscode';
import { QueryWorkbench } from '../workbench/queryWorkbench';
import { Memory } from './util';
import { Constants } from './constants';
import { Commands } from '../commands/extensionCommands/commands';
import { SearchWorkbench } from '../commands/fts/SearchWorkbench/searchWorkbench';
import SearchIndexNode from '../model/SearchIndexNode';

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


export const showSearchContextStatusbar = async (editor: vscode.TextEditor, searchNode: SearchIndexNode, workbench: SearchWorkbench, globalStatusBarItem: vscode.StatusBarItem) => {
    let editorId = editor.document.uri.toString();
    let editorContext = workbench.editorToContext.get(editorId);

    // Hide all other status bar items if present
    workbench.editorToContext.forEach((context, key) => {
        if (key !== editorId && context.statusBarItem) {
            context.statusBarItem.hide();
        }
    });

    editorContext = {
        bucketName: searchNode.bucketName,
        indexName: searchNode.indexName,
        statusBarItem: globalStatusBarItem,
        searchNode: searchNode
    };
    workbench.editorToContext.set(editorId, editorContext);


    // Update global status bar text based on Node selected by user
    let displayBucketName = searchNode.bucketName.length > 15 ? `${searchNode.bucketName.substring(0, 13)}...` : searchNode.bucketName;
    let displayIndexName = searchNode.searchIndexName.length > 15 ? `${searchNode.searchIndexName.substring(0, 13)}...` : searchNode.searchIndexName;
    editorContext.statusBarItem.text = `$(group-by-ref-type) ${displayBucketName} > ${displayIndexName}`;
    editorContext.statusBarItem.tooltip = "Search Query Context";
    editorContext.statusBarItem.command = Commands.searchContext;

    // Check and update the context if it has changed
    if (editorContext.searchNode !== searchNode) {
        editorContext.searchNode = searchNode;
        workbench.editorToContext.set(editorId, editorContext);
    }

    editorContext.statusBarItem.show();
};


