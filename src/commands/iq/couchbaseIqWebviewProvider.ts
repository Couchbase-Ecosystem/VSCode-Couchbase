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
import { iqChatHandler } from './iqChatHandler';
import { iqLoginHandler, iqSavedLoginDataGetter, iqSavedLoginHandler } from './iqLoginhandler';
import { Memory } from '../../util/util';
import { Constants } from '../../util/constants';

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

        // Save view id to memory so it can be accessed from outside
        Memory.state.update(Constants.IQ_WEBVIEW, this._view);

        this._view.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "vscode-couchbase.iq.login": {
                    const organizations = await iqLoginHandler(message.value);
                    if (organizations) {
                        this._view?.webview.postMessage({
                            command: "vscode-couchbase.iq.organizationDetails",
                            organizations: organizations
                        });
                    } else {
                        // TODO: Add some login error
                    }
                    break;
                }
                case "vscode-couchbase.iq.sendMessageToIQ": {
                    const result = await iqChatHandler(message.value);
                    if (result.error !== "") {
                        if (result.status === "401") {
                            this._view?.webview.postMessage({
                                command: "vscode-couchbase.iq.forcedLogout",
                                error: result.error
                            });
                        } else {
                            // TODO: Handle If some other error is received
                        }
                    } else {
                        this._view?.webview.postMessage({
                            command: "vscode-couchbase.iq.getMessageFromIQ",
                            content: result.content
                        });
                    }
                    break;
                }
                case "vsode-couchbase.iq.getSavedLogin": {
                    const savedLoginDetails = await iqSavedLoginDataGetter();
                    this._view?.webview.postMessage({
                        command: "vscode-couchbase.iq.savedLoginDetails",
                        savedLoginDetails: savedLoginDetails
                    });
                    break;
                }
                case "vscode-couchbase.iq.singleClickSignIn": {
                    const organizations = await iqSavedLoginHandler(message.value.username);
                    if (organizations) {
                        this._view?.webview.postMessage({
                            command: "vscode-couchbase.iq.organizationDetails",
                            organizations: organizations
                        });
                    } else {
                        // TODO: Add some login error
                    }
                    break;
                }
            }
        });
    }
}