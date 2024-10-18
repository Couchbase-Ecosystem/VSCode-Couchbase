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

export const getClusterConnectingFormView = (message: any) => {
    return /*HTML*/`
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
                input[type="checkbox"] {
                    appearance: none;
                    -webkit-appearance: none;
                    width: 15px;
                    height: 15px;
                    border-radius: 2px;
                    outline: none;
                    border: 1px solid #999;
                    background-color: white;
                }
                
                input[type="checkbox"]:checked {
                    background-color: #ea2328;
                }
        
                input[type="checkbox"]:checked::before {
                    content: '\\2714';
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 12px;
                    color: white;
                    height: 100%;
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
                width: 60%;
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
                .secure-box {
                    margin-top: 5px;
                    gap: 2px;
                    display: flex;
                    align-items: center;
                }
                .advanced-settings {
                    margin-top: 20px;
                }

                .advanced-settings summary {
                    cursor: pointer;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                .troubleshooting-message {
                    margin-bottom: 15px;
                }

                .bucket-input {
                    margin-bottom: 10px;
                }

                #testConnectionButton {
                    margin-top: 10px;
                }

                #testConnectionResults {
                    margin-top: 15px;
                    border: 1px solid var(--vscode-input-border);
                    padding: 10px;
                    display: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="left-container">
                    <h1>Connect to Couchbase</h1>
                    <b>Enter your connection details below</b><br><br>
                    <div>
                    <label for="url">Connection String</label><br>
                    <input type="text" id="url" name="url" placeholder="localhost" value=${message?.url ?? "localhost"} />
                    <div class="secure-box">
                    <input type="checkbox" id="secureCheck" ${message?.isSecure ? 'checked' : ''}>
                    <label for="secure">Use Secure Connection</label> 
                    </div>
                    <span id="urlErr" class="error-message"></span><br/>
                    <br/>
                    <label for="url">Username</label><br>
                    <input type="text" id="username" name="username" placeholder="Username" value=${message?.username ?? "Administrator"} />
                    <span id="usernameErr" class="error-message"></span><br/><br/>
                    <label for="password">Password</label><br> 
                    <input type="password" id="password" placeholder="Password" value=${message?.password ?? "password"}>
                    <span id="passwordErr" class="error-message"></span><br/><br/>
                    <label for="connectionIndetifier">Name</label><br>
                    <input type="text" id="connectionIdentifier" name="identifier" placeHolder="Name of your connection" value=${message?.connectionIdentifier ?? ""}>
                    <span id="connectionIdentifierErr" class="error-message"></span><br/><br/>
                    <div class="advanced-settings">
                    <details>
                        <summary>Advanced Settings</summary>
                        <div class="troubleshooting-message">
                            <p>If you can't successfully connect to your cluster, try informing an existing bucket in the field below and click on <strong>Test Connection</strong>. It will run the <strong>SDK Doctor</strong>, a utility that tries to identify potential issues.</p>
                        </div>
                        <div class="bucket-input">
                            <label for="bucketName">Bucket Name:</label><br>
                            <input type="text" id="bucketName" name="bucketName" placeholder="Inform any existing bucket in your cluster">
                        </div>
                        <button class="redButton" id="testConnectionButton" onclick="testConnection()">Test Connection</button>
                        <div id="testConnectionResults"></div>
                    </details>
                    <br/>
                </div>
                    <div class="button-group">
                        <button id="connectButton" class="redButton" onClick="validateRequest() && postRequestToConnect()">Connect</button>
                        <button type="secondary" id="cancelButton" onClick="cancelRequest()"> Cancel </button>
                    </div>
                    </div>
                </div>
                <div class="right-container">
                    <img src="https://www.couchbase.com/wp-content/uploads/2022/08/CB-logo-R_B_B.png" />
                    <div>
                        <h2>
                        New to Couchbase and don't have a cluster?
                        </h2>
                    </div>
                    <div>
                        <h4>
                        If you don't already have a cluster you can install couchbase locally or create a cluster using capella
                        </h4>
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

                const connectionIdentifier = document.querySelector("#connectionIdentifier");
                const connectionIdentifierErr = document.querySelector("#connectionIdentifierErr");

                connectionIdentifier.onfocus = function() {
                    connectionIdentifier.style.border="none";
                    connectionIdentifierErr.innerHTML="";
                }

                const urlInput = document.getElementById("url");
                const secureCheck = document.getElementById("secureCheck");
                
                urlInput.addEventListener("input", () => {
                    if (urlInput.value.endsWith(".cloud.couchbase.com")) {
                      secureCheck.checked = true;
                    }
                });

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
                    if(username === null || username == "") {
                        document.getElementById('username').style.border="solid red";
                        document.getElementById('usernameErr').innerHTML ='Username is required';
                        err = true;
                    }
                    if(password === null || password == "") {
                        document.getElementById('password').style.border="solid red";
                        document.getElementById('passwordErr').innerHTML ='Password is required';
                        err = true;
                    }
                    if(identifier === null || identifier == "") {
                        document.getElementById('connectionIdentifier').style.border="solid red";
                        document.getElementById('connectionIdentifierErr').innerHTML ='Connection Identifier is required';
                        err = true;
                    }
                    if(err) {
                        return false
                    }
                    return true;
                }
                function postRequestToConnect(){
                    document.getElementById("connectButton").disabled = 'true';
                    document.getElementById("connectButton").style.backgroundColor = 'grey';
                    const vscode = acquireVsCodeApi();
                    let url = document.getElementById('url').value;
                    let username = document.getElementById('username').value;
                    let password = document.getElementById('password').value;
                    let identifier = document.getElementById('connectionIdentifier').value;
                    let checkBox = document.getElementById("secureCheck");
                    if(url.startsWith("couchbase://") || url.startsWith("couchbases://"))
                    {
                        url = url.slice(url.indexOf('//') + 2);
                    }
                    vscode.postMessage({
                        command: 'submit',
                        url: url,
                        username: username,
                        password: password,
                        connectionIdentifier: identifier,
                        isSecure: checkBox.checked
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
};