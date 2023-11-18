/*
 *     Copyright 2011-2023 Couchbase, Inc.
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
import * as path from 'path';
import { getIQWebviewContent } from '../../webViews/iq/couchbaseIq.webview';
import { iqLoginHandler } from './iqLoginhandler';

export class CouchbaseIqWebviewProvider implements vscode.WebviewViewProvider {
    public _view?: vscode.WebviewView;
    public _context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
    }

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        this._view.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this._context.extensionPath, "dist"))
            ]
        };

        const reactAppPathOnDisk = vscode.Uri.file(
            path.join(this._context.extensionPath, "dist", "iq", "reactBuild.js")
        );

        const reactAppUri = this._view.webview.asWebviewUri(reactAppPathOnDisk);
        this._view.webview.html = getIQWebviewContent(reactAppUri, this._context);

        this._view.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "vscode-couchbase.iq.login": {
                    console.log("message received", message.value);
                    const organizations = await iqLoginHandler(message.value);

                    this._view?.webview.postMessage({
                        command: "vscode-couchbase.iq.organizationDetails",
                        organizations: organizations
                    });

                    break;
                }
            }
        });
    }
}