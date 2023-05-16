export function getSampleProjects(): string {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <title>Couchbase Sample Projects</title>
            <style>
                h1 {
                    font-size: 24px;
                }
                h3 {
                    font-size: 18px;
                }
                ul {
                    list-style: none;
                    margin: 0px;
                    padding-left: 0;
                }
                li {
                    white-space: nowrap;
                }
            </style>
        </head>
        <body>
            <h1>Sample Projects</h1>
            <br/>
            <h3>Java</h3>
            <ul>
                <li>
                    <button onclick="getSample('java-springdata-quickstart')">
                        <span>Create Spring Data CRUD project</span>
                    </button>
                </li>
                <li>
                    <button onclick="getSample('java-springboot-quickstart')">
                        <span>Create Spring Boot CRUD project</span>
                    </button>
                </li>
                <li>
                    <button onclick="getSample('java-transactions-quickstart')">
                        <span>Create Key-Value Transaction Demo project</span>
                    </button>
                </li>
            </ul>
            <h3>NodeJS</h3>
            <ul>
                <li>
                    <button onclick="getSample('ottomanjs-quickstart')">
                        <span>Create Ottoman CRUD project</span>
                    </button>
                </li>
                <li>
                    <button onclick="getSample('nodejs-quickstart')">
                        <span>Create NodeJS CRUD project</span>
                    </button>
                </li>
                <li>
                    <button onclick="getSample('nextjs-quickstart')">
                        <span>Create NextJS CRUD project</span>
                    </button>
                </li>
            </ul>
            <h3>.NET</h3>
            <ul>
                <li>
                    <button onclick="getSample('aspnet-quickstart')">
                        <span>Create ASP.NET CRUD project</span>
                    </button>
                </li>
                <li>
                    <button onclick="getSample('aspnet-quickstart-minapi')">
                        <span>Create ASP.NET Minimum API CRUD project</span>
                    </button>
                </li>
            </ul>
            <h3>Python</h3>
            <ul>
                <li>
                    <button onclick="getSample('python-quickstart')">
                        <span>Create Flask CRUD project</span>
                    </button>
                </li>
            </ul>
            <h3>Golang</h3>
            <ul>
                <li>
                    <button onclick="getSample('golang-quickstart')">
                        <span>Create Golang CRUD project</span>
                    </button>
                </li>
            </ul>
            <h3>Scala</h3>
            <ul>
                <li>
                    <button onclick="getSample('scala-quickstart')">
                        <span>Create Akka CRUD project</span>
                    </button>
                </li>
            </ul>
            <script>
                const vscode = acquireVsCodeApi();
                function getSample(sampleName) {
                    vscode.postMessage({
                        repo: sampleName
                    });
                }
            </script>
        </body>
        </html>
     `;
}
