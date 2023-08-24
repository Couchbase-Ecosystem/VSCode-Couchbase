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
import * as vscode from 'vscode';

class SqlppDocumentContentProvider implements vscode.TextDocumentContentProvider {
    provideTextDocumentContent(uri: vscode.Uri): string {
        // You can provide initial content here if needed
        return '';
    }
}

export default class UntitledSqlppDocumentService {
    public sqlppProvider = new SqlppDocumentContentProvider();
    private untitledCount: number = 1;
    private sqlppScheme: string = 'sqlpp';

    public disposable = vscode.workspace.registerTextDocumentContentProvider(this.sqlppScheme, this.sqlppProvider);
    // context.subscriptions.push(disposable);

    constructor() {
    }



    /**
 * Opens an untitled SQL++ document.
 * [open document](#workspace.onDidOpenTextDocument)-event fires.
 * The document to open is denoted by the [uri](#Uri). Two schemes are supported:
 *
 * Uris with other schemes will make this method return a rejected promise.
 *
 * @param uri Identifies the resource to open.
 * @return A promise that resolves to a [document](#TextDocument).
 * @see vscode.workspace.openTextDocument
 */
    public openSqlppTextDocument(): Thenable<vscode.TextDocument> {
        const uri = vscode.Uri.parse(`${this.sqlppScheme}:workbench-${this.untitledCount}.sqlpp`);
        this.untitledCount++;

        return vscode.workspace.openTextDocument(uri);
    }

    /**
 * Show the given document in a text editor. A [column](#ViewColumn) can be provided
 * to control where the editor is being shown. Might change the [active editor](#window.activeTextEditor).
 *
 * @param document A text document to be shown.
 * @param column A view column in which the editor should be shown. The default is the [one](#ViewColumn.One), other values
 * are adjusted to be __Min(column, columnCount + 1)__.
 * @param preserveFocus When `true` the editor will not take focus.
 * @return A promise that resolves to an [editor](#TextEditor).
 */
    public showTextDocument(document: vscode.TextDocument, column?: vscode.ViewColumn, preserveFocus?: boolean): Thenable<vscode.TextEditor> {
        return vscode.window.showTextDocument(document, column, preserveFocus);
    }


    /**
     * Creates new untitled document for SQL query and opens in new editor tab
     */
    public newQuery(): Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {
            try {

                // Open an untitled document. So the  file doesn't have to exist in disk
                this.openSqlppTextDocument().then(doc => {
                    vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One, preserveFocus: false }).then(() => {
                        resolve(true);
                    });
                });

                // const uri = vscode.Uri.parse(`workbench-${this.untitledCount}.sqlpp`);
                // this.untitledCount++;

                // vscode.workspace.openTextDocument().then((doc) => {
                //     // Save the document before showing it
                //     doc.save().then(() => {
                //         vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One, preserveFocus: false });
                //     });
                // });
            } catch (error) {
                reject(error);
            }
        });
    }
}
