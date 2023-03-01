export function getClusterConnectingFormView(message: any): string {
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
                background: var(--vscode-button-background);
                }
                .redButton{
                background: #ea2328;
                }
                .redButton:hover {
                background: #bb1117;
                }
                #cancelButton {
                background: var(--vscode-button-secondaryBackground);;
                }
                #cancelButton:hover {
                background: var(--vscode-button-secondaryHoverBackground);
                }
                button:hover {
                cursor: pointer;
                background: var(--vscode-button-hoverBackground);;
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
                .error-message {
                color: red;
                }
                input::placeholder,
                textarea::placeholder {
                color: var(--vscode-input-placeholderForeground);
                }
                .container {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 20px;
                margin: 50px;
                }
                .left-container {
                width: 50%;
                }
                .right-container {
                background: #f2f2f2;
                text-align: center; 
                color: black;
                padding: 30px;
                width: 200px;
                height: 300px;
                display: flex;
                justify-content: center;
                flex-direction: column;
                align-items: center;
                button: {
                background: red;
                }
                }
                .button-group {
                display: inline-flex;
                flex-wrap: wrap;
                gap: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="left-container">
                    <h1>Connect to Couchbase</h1>
                    <b>Enter your connection details below</b><br><br>
                    <div>
                    <label for="url">Cluter Connection URL</label><br>
                    <input type="text" id="url" name="url" placeholder="couchbase://localhost" value=${message?.url ?? "couchbase://localhost"} />
                    <span id="urlErr" class="error-message"></span><br/><br/>
                    <label for="url">Username:</label><br>
                    <input type="text" id="username" name="username" placeholder="Username" value=${message?.username ?? "Administrator"} />
                    <span id="usernameErr" class="error-message"></span><br/><br/>
                    <label for="password">Password:</label><br> 
                    <input type="password" id="password" placeholder="Password" value=${message?.password ?? "password"}>
                    <span id="passwordErr" class="error-message"></span><br/><br/>
                    <label for="connectionIndetifier">Connection Identifier (optional):</label><br>
                    <input type="text" id="connectionIdentifier" name="identifier" placeHolder="Connection Identifier" value=${message?.connectionIdentifier ?? ""}> <br/><br/>
                    <div class="button-group">
                        <button class="redButton" onClick="validateRequest() && postRequestToConnect()">Connect</button>
                        <button type="secondary" id="cancelButton" onClick="cancelRequest()"> Cancel </button>
                    </div>
                    </div>
                </div>
                <div class="right-container">
                    <img src="https://www.couchbase.com/wp-content/uploads/2022/08/CB-logo-R_B_B.png" />
                    <div>
                        <h2>
                        New to Couchbase and don't have a cluster?
                        <h2>
                    </div>
                    <div>
                        <h4>
                        If you don't already have a cluster you can install couchbase locally or create a cluster using capella
                        <h4>
                    </div>
                    <a href="https://www.couchbase.com/downloads/?family=couchbase-server">
                    <button class="redButton" type="button">Download</button>
                    </a>
                    <br/>
                    <a href="https://cloud.couchbase.com/sign-up?source=vscode">
                    <button class="redButton" type="button">Free Capella Trial</button>
                    </a>
                </div>
            </div>
            <script>
                const url = document.querySelector("#url");
                const urlErr = document.querySelector("#urlErr");

                url.onfocus = function() {
                    url.style.border="none";
                    urlErr.innerHTML="";
                }

                const username = document.querySelector("#username");
                const usernameErr = document.querySelector("#usernameErr");

                username.onfocus = function() {
                    username.style.border="none";
                    usernameErr.innerHTML="";
                }

                const password = document.querySelector("#password");
                const passwordErr = document.querySelector("#passwordErr");

                password.onfocus = function() {
                    password.style.border="none";
                    passwordErr.innerHTML="";
                }
                function validateRequest() {
                    let url = document.getElementById('url').value;
                    let username = document.getElementById('username').value;
                    let password = document.getElementById('password').value;
                    let identifier = document.getElementById('connectionIdentifier').value;
                    let err = false;
                    if(url === null || url == "") {
                        document.getElementById('url').style.border="solid red";
                        document.getElementById('urlErr').innerHTML ='Cluster Connection URL is required';
                        err = true;
                    }
                    else {
                        document.getElementById('url').style.border="none";
                        document.getElementById('urlErr').innerHTML ='';
                    }
                    if(username === null || username == "") {
                        document.getElementById('username').style.border="solid red";
                        document.getElementById('usernameErr').innerHTML ='Username is required';
                        err = true;
                    }
                    else {
                        document.getElementById('username').style.border="none";
                        document.getElementById('usernameErr').innerHTML ='';
                    }
                    if(password === null || password == "") {
                        document.getElementById('password').style.border="solid red";
                        document.getElementById('passwordErr').innerHTML ='Password is required';
                        err = true;
                    }
                    else {
                        document.getElementById('password').style.border="none";
                        document.getElementById('passwordErr').innerHTML ='';
                    }
                    if(err) {
                        return false
                    }
                    return true;
                }
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
                    })
                };
                function cancelRequest(){
                    const vscode = acquireVsCodeApi();
                    vscode.postMessage({
                    command: 'cancel'
                })};
            </script>
        </body>
        </html>
     `;
}