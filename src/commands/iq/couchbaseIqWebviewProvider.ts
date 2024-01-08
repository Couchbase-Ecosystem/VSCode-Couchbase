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
import { iqChatHandler } from './chat/iqChatHandler';
import { iqLoginHandler, iqSavedLoginDataGetter, iqSavedLoginHandler, verifyOrganization } from './iqLoginhandler';
import { Memory } from '../../util/util';
import { Constants } from '../../util/constants';
import { CacheService } from '../../util/cacheService/cacheService';
import { iqFeedbackHandler } from './iqFeedbackHandler';
import { IStoredMessages } from './chat/types';
import { removeJWT } from './iqLogoutHandler';



export class CouchbaseIqWebviewProvider implements vscode.WebviewViewProvider {
    public _view?: vscode.WebviewView;
    public _context: vscode.ExtensionContext;
    public cacheService: CacheService;
    public allMessages: IStoredMessages[];

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

        vscode.window.onDidChangeActiveColorTheme((newTheme) => {
            if (newTheme.kind === vscode.ColorThemeKind.Dark) {
                this._view?.webview.postMessage({
                    command: "vscode-couchbase.iq.changeColorTheme",
                    theme: "Dark"
                });
            } else {
                this._view?.webview.postMessage({
                    command: "vscode-couchbase.iq.changeColorTheme",
                    theme: "Light"
                });
            }
        });

        this._view.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "vscode-couchbase.iq.login": {
                    const organizations = await iqLoginHandler(message.value);
                    if (!organizations || organizations.length === 0) {
                        // TODO: send login error and do break
                        break;
                    }

                    let config = vscode.workspace.getConfiguration('couchbase');
                    const savedOrganization = config.get('iq.organization');  // Get saved organization from vscode couchbase settings
                    if (savedOrganization !== "") {
                        let savedOrganizationDetail = undefined;
                        for (let org of organizations) {
                            if (org.data.id === savedOrganization) {
                                savedOrganizationDetail = org;
                                break;
                            }
                        }

                        if (savedOrganizationDetail === undefined) {
                            // Remove organization from saved settings.
                            config.update("iq.organization", "");
                            this._view?.webview.postMessage({
                                command: "vscode-couchbase.iq.organizationDetails", 
                                organizations: organizations,
                                isSavedOrganization: false,
                                savedOrganization: undefined
                            });
                        } else {
                            const {isOrgVerified, errorMessage} = await verifyOrganization(savedOrganizationDetail.data.id);
                            if(isOrgVerified){
                                this._view?.webview.postMessage({
                                    command: "vscode-couchbase.iq.organizationDetails",
                                    organizations: organizations,
                                    isSavedOrganization: true,
                                    savedOrganization: savedOrganizationDetail
                                });
                            } else {
                                config.update("iq.organization", "");
                                this._view?.webview.postMessage({
                                    command: "vscode-couchbase.iq.forcedLogout",
                                    error: errorMessage
                                });
                            }
                        }
                    } else {
                        this._view?.webview.postMessage({
                            command: "vscode-couchbase.iq.organizationDetails",
                            organizations: organizations,
                            isSavedOrganization: false,
                            savedOrganization: undefined
                        });
                    }
                    break;
                }
                case "vscode-couchbase.iq.sendMessageToIQ": {
                    const result = await iqChatHandler(message.value, this.cacheService, this.allMessages, webviewView);
                    if (result.error !== "") {
                        let errorMsg = "";
                        try {
                            errorMsg = JSON.stringify(result.error);
                        } catch  {
                            errorMsg = "Internal Error: Please try again later or check settings on couchbase cloud";
                        }
                        if (result.status === "401") {
                            console.log("Got forced logout");
                            
                            this._view?.webview.postMessage({
                                command: "vscode-couchbase.iq.forcedLogout",
                                error: result.error
                            });
                        } else {
                            // TODO: Handle If some other error is received
                            this._view?.webview.postMessage({
                                command: "vscode-couchbase.iq.forcedLogout",
                                error: result.error
                            });
                        }
                    } else {
                        this._view?.webview.postMessage({
                            command: "vscode-couchbase.iq.getMessageFromIQ",
                            content: result.content,
                            isDarkTheme: vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark
                        });
                    }
                    break;
                }
                case "vscode-couchbase.iq.getSavedLogin": {
                    const savedLoginDetails = await iqSavedLoginDataGetter();
                    this._view?.webview.postMessage({
                        command: "vscode-couchbase.iq.savedLoginDetails",
                        savedLoginDetails: savedLoginDetails
                    });
                    break;
                }
                case "vscode-couchbase.iq.singleClickSignIn": {
                    const organizations = await iqSavedLoginHandler(message.value.username);
                    if (!organizations || organizations.length === 0) {
                        // TODO: send login error and do break
                        break;
                    }

                    let config = vscode.workspace.getConfiguration('couchbase');
                    const savedOrganization = config.get('iq.organization');  // Get saved organization from vscode couchbase settings
                    if (savedOrganization !== "") {
                        let savedOrganizationDetail = undefined;
                        for (let org of organizations) {
                            if (org.data.id === savedOrganization) {
                                savedOrganizationDetail = org;
                                break;
                            }
                        }

                        if (savedOrganizationDetail === undefined) {
                            // Remove organization from saved settings.
                            config.update("iq.organization", "");
                            this._view?.webview.postMessage({
                                command: "vscode-couchbase.iq.organizationDetails",
                                organizations: organizations,
                                isSavedOrganization: false,
                                savedOrganization: undefined
                            });
                        } else {
                            const {isOrgVerified, errorMessage} = await verifyOrganization(savedOrganizationDetail.data.id);
                            if(isOrgVerified) {
                                this._view?.webview.postMessage({
                                    command: "vscode-couchbase.iq.organizationDetails",
                                    organizations: organizations,
                                    isSavedOrganization: true,
                                    savedOrganization: savedOrganizationDetail
                                });
                            } else {
                                config.update("iq.organization", "");
                                this._view?.webview.postMessage({
                                    command: "vscode-couchbase.iq.forcedLogout",
                                    error: errorMessage
                                });
                            }
                        }
                    } else {
                        this._view?.webview.postMessage({
                            command: "vscode-couchbase.iq.organizationDetails",
                            organizations: organizations,
                            isSavedOrganization: false,
                            savedOrganization: undefined
                        });
                    }
                    break;
                }
                case "vscode-couchbase.iq.verifyOrganizationAndSave": {
                    const {isOrgVerified, errorMessage} = await verifyOrganization(message.value.organizationDetails.data.id);
                    if(isOrgVerified && message.value.rememberOrgChecked) {
                        let config = vscode.workspace.getConfiguration('couchbase');
                        config.update('iq.organization', message.value.organizationDetails.data.id, vscode.ConfigurationTarget.Global);
                    } else if(!isOrgVerified) {
                        this._view?.webview.postMessage({
                            command: "vscode-couchbase.iq.forcedLogout",
                            error: errorMessage
                        });
                    }
                    break;
                }
                case "vscode-couchbase.iq.sendFeedbackPerMessageEmote": {
                    await iqFeedbackHandler(this._context, message.value, this.allMessages);
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
                case "vscode-couchbase.iq.removeSavedJWT": {
                    removeJWT();
                    break;
                }
            }
        });
    }
}