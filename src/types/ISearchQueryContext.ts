import * as vscode from 'vscode';
import SearchIndexNode from '../model/SearchIndexNode';

export interface ISearchQueryContext {
    bucketName: string;
    indexName: string;
    statusBarItem: vscode.StatusBarItem;  
    searchNode: SearchIndexNode;
}
