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
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: 
            https:; script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline' ${remoteEntryServer} ${webviewGenericCspSource}; style-src vscode-resource: 'unsafe-inline' http: https: data:; connect-src ${remoteEntryServer} ${webviewGenericCspSource};">
        <base href="${vscode.Uri.file(
        path.join(context.extensionPath, "dist")
    ).with({
        scheme: "vscode-resource",
    })}/">
    </head>
    <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"><h1>Loading...</h1></div>
        <script nonce="${nonce}" src="${reactAppUri}"></script>
    </body>
    </html>`;
};
