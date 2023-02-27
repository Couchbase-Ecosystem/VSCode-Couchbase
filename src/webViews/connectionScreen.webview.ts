export function getClusterConnectingFormView(): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Add Connection</title>
        </head>
        <body>
        <h1>Connect to Couchbase</h1>
        <b>Enter your connection details below</b><br><br>
        <form>
            <label for="url">Cluter Connection URL</label><br>
            <input type="text" id="url" name="url" placeholder="couchbase://localhost" required /> <br/><br/>
            <label for="url">Username:</label><br>
            <input type="text" id="username" name="class" placeholder="Username" required /> <br/><br/>
            <label for="password">Password:</label><br> 
            <input type="password" id="password" name="rollno" placeholder="Password" required> <br/><br/>
            <label for="connectionIndetifier">Connection Identifier (optional):</label><br>
            <input type="text" id="connectionIdentifier" name="identifier" placeHolder="Connection Identifier" value=""> <br/><br/>
            <input type="button" value="Connect" onclick="postRequestToConnect()"/>
        </form>
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