import * as vscode from 'vscode';
export class WorkbenchWebviewProvider implements vscode.WebviewViewProvider{
    private _view?: vscode.WebviewView;

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        this._view.webview.options = {
            enableScripts: true
        };

        this._view.webview.html = '<h1>Hello from My Custom Panel</h1>';
    }

}