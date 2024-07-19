/*
 *     Copyright 2011-2020 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import * as vscode from "vscode";
import { MemFS } from "../../../util/fileSystemProvider";
import SearchIndexNode from "../../../model/SearchIndexNode";

class SearchJsonDocumentContentProvider
    implements vscode.TextDocumentContentProvider
{
    provideTextDocumentContent(uri: vscode.Uri): string {
        return "";
    }
}

export default class UntitledSearchJsonDocumentService {
    public searchJsonProvider = new SearchJsonDocumentContentProvider();
    private untitledCount: number = 1;
    private searchJsonScheme: string = ".cbs.json";

    public disposable = vscode.workspace.registerTextDocumentContentProvider(
        this.searchJsonScheme,
        this.searchJsonProvider,
    );

    constructor() {}

    public async openSearchJsonTextDocument(
        searchIndexNode: SearchIndexNode,
        memFs: MemFS,
    ): Promise<vscode.TextEditor> {
        const uri = vscode.Uri.parse(
            `couchbase:/search-workbench-${searchIndexNode.indexName}-${this.untitledCount}.cbs.json`,
        );
        this.untitledCount++;
        const defaultJsonContent = `{
    "query": {
        "query": "your_query_here"
    },
    "fields": [
        "*"
    ]
}`;
        let documentContent = Buffer.from(defaultJsonContent);
        memFs.writeFile(uri, documentContent, {
            create: true,
            overwrite: true,
        });

        const document = await vscode.workspace.openTextDocument(uri);
        document.save();
        await vscode.window.showTextDocument(document, { preview: false });
        return await vscode.window.showTextDocument(document, {
            preview: false,
        });
    }

    public showTextDocument(
        document: vscode.TextDocument,
        column?: vscode.ViewColumn,
        preserveFocus?: boolean,
    ): Thenable<vscode.TextEditor> {
        return vscode.window.showTextDocument(document, column, preserveFocus);
    }

    public newQuery(
        searchIndexNode: SearchIndexNode,
        memFs: MemFS,
    ): Promise<vscode.TextEditor> {
        return new Promise<vscode.TextEditor>((resolve, reject) => {
            this.openSearchJsonTextDocument(searchIndexNode, memFs)
                .then(resolve)
                .catch(reject);
        });
    }
}
