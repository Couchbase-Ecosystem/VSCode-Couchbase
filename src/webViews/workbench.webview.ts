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
import * as path from "path";
import { getNonce } from "../util/common";

export const getWebviewContent = (
    reactAppUri: vscode.Uri,
    context: vscode.ExtensionContext
): string => {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(
        path.join(context.extensionPath, "dist", "reactBuild.js")
    );
    const webviewGenericCspSource = "https://*.vscode-cdn.net";
    const remoteEntryServer = "http://localhost:5001/";

    const nonce = getNonce();
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Config View</title>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; font-src 'self' data: http://localhost:5001; img-src vscode-resource: https:; script-src 'self' 'nonce-${nonce}'
             'unsafe-eval' 'unsafe-inline' ${remoteEntryServer} ${webviewGenericCspSource}; style-src vscode-resource: 'unsafe-inline' http: https: data:; connect-src ${remoteEntryServer} ${webviewGenericCspSource} ws://0.0.0.0:5001/ws;">

        <base href="${vscode.Uri.file(
        path.join(context.extensionPath, "dist")
    ).with({
        scheme: "vscode-resource",
    })}/">
    </head>
    <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"><h1>Loading...</h1></div>
        <script nonce="${nonce}">
        const tsvscode = acquireVsCodeApi();
        </script>
        <script nonce="${nonce}" src="${reactAppUri}"></script>
    </body>
    </html>`;
};
