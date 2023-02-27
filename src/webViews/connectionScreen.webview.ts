export function getClusterConnectingFormView(): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Add Connection</title>
        <style>
        :root {
            --container-padding: 20px;
            --input-padding-vertical: 6px;
            --input-padding-horizontal: 4px;
            --input-margin-vertical: 4px;
            --input-margin-horizontal: 0;
        }
        
        body {
            padding: 0 var(--container-padding);
            margin-top: 30px;
            color: var(--vscode-foreground);
            font-size: var(--vscode-font-size);
            font-weight: var(--vscode-font-weight);
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
        }
        
        body > *,
        form > * {
            margin-block-start: var(--input-margin-vertical);
            margin-block-end: var(--input-margin-vertical);
        }
        
        *:focus {
            outline-color: var(--vscode-focusBorder) !important;
        }
        
        a {
            color: var(--vscode-textLink-foreground);
        }
        
        a:hover,
        a:active {
            color: var(--vscode-textLink-activeForeground);
        }
        
        code {
            font-size: var(--vscode-editor-font-size);
            font-family: var(--vscode-editor-font-family);
        }
        
        button {
            border: none;
            padding: var(--input-padding-vertical) var(--input-padding-horizontal);
            text-align: center;
            outline: 1px solid transparent;
            outline-offset: 2px !important;
            color: var(--vscode-button-foreground);
            background: #ea2328;
        }
        
        button:hover {
            cursor: pointer;
            background: #bb1117;
        }
        
        button:focus {
            outline-color: var(--vscode-focusBorder);
        }
        
        input:not([type='checkbox']),
        textarea {
            display: block;
            width: 50%;
            border: none;
            font-family: var(--vscode-font-family);
            padding: var(--input-padding-vertical) var(--input-padding-horizontal);
            color: var(--vscode-input-foreground);
            outline-color: var(--vscode-input-border);
            background-color: var(--vscode-input-background);
        }
        
        input::placeholder,
        textarea::placeholder {
            color: var(--vscode-input-placeholderForeground);
        }
        
        </style>
        </head>
        <body>
        <h1>Connect to Couchbase</h1>
        <b>Enter your connection details below</b><br><br>
        <div class="container" style="display: flex;">
            <div  style="width: 50%;">
                <form onSubmit="postRequestToConnect()">
                    <label for="url">Cluter Connection URL</label><br>
                    <input type="text" id="url" name="url" placeholder="couchbase://localhost" required /> <br/><br/>
                    <label for="url">Username:</label><br>
                    <input type="text" id="username" name="username" placeholder="Username" required /> <br/><br/>
                    <label for="password">Password:</label><br> 
                    <input type="password" id="password" placeholder="Password" required> <br/><br/>
                    <label for="connectionIndetifier">Connection Identifier (optional):</label><br>
                    <input type="text" id="connectionIdentifier" name="identifier" placeHolder="Connection Identifier" value=""> <br/><br/>
                    <button type="submit">Connect</button>
                </form>
            </div>
            <div style="flex-grow: 1 background:white">

            </div>
        </div>
        <script>
        function postRequestToConnect(){
            const vscode = acquireVsCodeApi();
            let url = document.getElementById('url').value;
            let username = document.getElementById('username').value;
            let password = document.getElementById('password').value;
            let identifier = document.getElementById('connectionIdentifier').value;
            vscode.postMessage({
            command: 'submit',
            url: url,
            username: username,
            password: password,
            connectionIdentifier: identifier
        })};
        </script>
        </body>
        </html>
     `;
}