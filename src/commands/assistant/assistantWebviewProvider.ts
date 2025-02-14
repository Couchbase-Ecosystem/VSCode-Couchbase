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

import * as vscode from "vscode";
import * as path from "path";
import { getIQWebviewContent } from "../../webViews/iq/couchbaseIq.webview";
import { assistantChat } from "./chat/chat";

import { Memory, getUUID } from "../../util/util";
import { Constants } from "../../util/constants";
import { CacheService } from "../../util/cacheService/cacheService";
import { applyQuery } from "../queryHistory/applyQuery";
import { allMessagesType } from "./chat/types";

export class CouchbaseAssistantWebviewProvider implements vscode.WebviewViewProvider {
    public _view?: vscode.WebviewView;
    public _context: vscode.ExtensionContext;
    public cacheService: CacheService;
    public allMessages: allMessagesType[];

    constructor(context: vscode.ExtensionContext, cacheService: CacheService) {
        this._context = context;
        this.cacheService = cacheService;
        this.allMessages = [];
    }

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        this._view.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this._context.extensionPath, "dist")),
            ],
        };

        const reactAppPathOnDisk = vscode.Uri.file(
            path.join(
                this._context.extensionPath,
                "dist",
                "assistant",
                "reactBuild.js"
            )
        );

        const reactAppUri = this._view.webview.asWebviewUri(reactAppPathOnDisk);
        this._view.webview.html = getIQWebviewContent(
            reactAppUri,
            this._context
        );

        // Save view id to memory so it can be accessed from outside
        Memory.state.update(Constants.IQ_WEBVIEW, this._view);

        vscode.window.onDidChangeActiveColorTheme((newTheme) => {
            if (newTheme.kind === vscode.ColorThemeKind.Dark) {
                this._view?.webview.postMessage({
                    command: "vscode-couchbase.iq.changeColorTheme",
                    theme: "Dark",
                });
            } else {
                this._view?.webview.postMessage({
                    command: "vscode-couchbase.iq.changeColorTheme",
                    theme: "Light",
                });
            }
        });

        this._view.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "vscode-couchbase.assistant.askAssistant": {
                    const result = await assistantChat(
                        message.value,
                        this.allMessages,
                        this.cacheService
                    );
                    if (result.error !== undefined) {
                        let errorMsg = "";
                        try {
                            if (typeof result.error !== "string") {
                                errorMsg = JSON.stringify(result.error);
                            } else {
                                errorMsg = result.error;
                            }
                        } catch {
                            errorMsg =
                                "Internal Error: Please try again later or check settings on couchbase cloud";
                        }
                        if (result.status.length > 3) {
                            // No 4xx or 5xx error
                            console.log("chat completed");

                            this._view?.webview.postMessage({
                                command: "vscode-couchbase.iq.chatCompleted",
                                error: errorMsg,
                            });
                        } else if (result.status === "401") {
                            console.log("Got forced logout");

                            this._view?.webview.postMessage({
                                command: "vscode-couchbase.iq.forcedLogout",
                                error: errorMsg,
                            });
                        } else {
                            // TODO: Handle If some other error is received
                            this._view?.webview.postMessage({
                                command: "vscode-couchbase.iq.forcedLogout",
                                error: errorMsg,
                            });
                        }
                    } else {
                        this._view?.webview.postMessage({                        
                            command: "vscode-couchbase.assistant.reply",
                            content: result.content,
                            isDarkTheme:
                                vscode.window.activeColorTheme.kind ===
                                vscode.ColorThemeKind.Dark,
                        });  
                    }
                    break;
                }
                case "vscode-couchbase.iq.executeActionCommand": {
                    vscode.commands.executeCommand(message.value);
                    break;
                }
                case "vscode-couchbase.iq.openLinkInBrowser": {
                    vscode.env.openExternal(vscode.Uri.parse(message.value));
                    break;
                }
                case "vscode-couchbase.iq.showLogoutButton": {
                    const enabled: boolean = message.value.enabled;
                    vscode.commands.executeCommand(
                        "setContext",
                        "isIqLogoutButtonBVisible",
                        enabled
                    );
                    break;
                }
                case "vscode-couchbase.iq.showNewChatButton": {
                    const enabled: boolean = message.value.enabled;
                    vscode.commands.executeCommand(
                        "setContext",
                        "isIqNewChatButtonBVisible",
                        enabled
                    );
                    break;
                }
                case "vscode-couchbase.iq.applyQuery": {
                    const query = message.value;
                    applyQuery({ query: query, id: getUUID() });
                    break;
                }
            }
        });
    }
}
