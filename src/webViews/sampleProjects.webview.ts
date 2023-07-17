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

export function getSampleProjectsView(): string {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Couchbase Sample Projects</title>
        <style>
          body {
            margin: 0;
            padding: 50px;
            font-family: Arial, sans-serif;
          }
  
          h1 {
            font-size: 32px;
          }
  
          h3 {
            font-size: 24px;
          }
  
          ul {
            list-style: none;
            margin: 0;
            padding: 0;
          }
  
          li {
            margin-bottom: 10px;
          }
  
          li button {
            background: none;
            border: none;
            color: var(--vscode-textLink-foreground);;
            cursor: pointer;
            padding: 0;
            margin: 0;
            font-size: 16px;
            text-decoration: underline;
            text-align: left;
          }
  
          .projects-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 20px;
          }
  
          .project-column {
            flex-basis: 48%;
          }
        </style>
      </head>
      <body>
        <h1>Sample Projects</h1>
        <br/>
        <div class="projects-container">
          <div class="project-column">
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
          </div>
          <div class="project-column">
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
          </div>
          <div class="project-column">
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
          </div>
          <div class="project-column">
            <h3>Python</h3>
            <ul>
              <li>
                <button onclick="getSample('python-quickstart')">
                  <span>Create Flask CRUD project</span>
                </button>
              </li>
            </ul>
          </div>
          <div class="project-column">
            <h3>Golang</h3>
            <ul>
              <li>
                <button onclick="getSample('golang-quickstart')">
                  <span>Create Golang CRUD project</span>
                </button>
              </li>
            </ul>
          </div>
          <div class="project-column">
            <h3>Scala</h3>
            <ul>
              <li>
                <button onclick="getSample('scala-quickstart')">
                  <span>Create Akka CRUD project</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
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
