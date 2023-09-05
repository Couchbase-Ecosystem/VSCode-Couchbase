import { Bucket, ScopeSpec } from 'couchbase';
import * as vscode from 'vscode';

export interface IQueryContextWebviewParams {
    styleSrc: vscode.Uri,
    editLogo: vscode.Uri,
    buckets: Bucket[],
    scopes: ScopeSpec[][]
}