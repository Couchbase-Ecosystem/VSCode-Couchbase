import * as vscode from 'vscode';
import * as path from 'path';
import { getNonce } from "../../util/common";

export const getIQWebviewContent = (
	reactAppUri: vscode.Uri,
	context: vscode.ExtensionContext
): string => {
	const webviewGenericCspSource = "https://*.vscode-cdn.net";

	const nonce = getNonce();
	return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Config View</title>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; font-src 'self' data: vscode-resource:; img-src vscode-resource: https:; script-src 'self' 'nonce-${nonce}'
             'unsafe-eval' 'unsafe-inline' ${webviewGenericCspSource}; style-src vscode-resource: 'unsafe-inline' http: https: data:; connect-src ${webviewGenericCspSource};">

        <base href="${vscode.Uri.file(
		path.join(context.extensionPath, "dist")
	).with({
		scheme: "vscode-resource",
	})}/">
    </head>
    <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="vscodeRootIQ"><h1>Loading...</h1></div>
    <script nonce="${nonce}">
    const tsvscode = acquireVsCodeApi();
    </script>
        <script nonce="${nonce}" src="${reactAppUri}"></script>
    </body>
    </html>`;
};
