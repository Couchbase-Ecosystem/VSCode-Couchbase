import { getFavoriteQueries } from "../util/favoriteQuery";

export const showFavoriteQueries = (): string => {
    let favQueries = getFavoriteQueries();
    return /*HTML*/`
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Query Context</title>
          
          <style>
             h3 {
             display: inline;
             }
             .favorite-queries-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
              }
              
              .favorite-queries-table {
                min-height: 150px;
                display: flex;
                justify-content: space-between;
                width: 100%;
                border: 1px solid var(--vscode-settings-sashBorder);
              }
              
              .favorite-queries-keys {
                display: block;
                position: relative;
                white-space: nowrap;
                width: 30%;
                border-right: 1px solid var(--vscode-settings-sashBorder);
                background-color: var(--vscode-sideBar-background);
                color: var(--vscode-sideBar-foreground);
              }
              .favorite-queries-keys-header {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                padding: 5px;
                border-bottom: 1px solid var(--vscode-settings-sashBorder);
                text-align: center;
                padding-left: 10px;
                padding-right: 10px;
              }
              
              .favorite-queries-key-container {
                max-height: 65vh;
                overflow-y: overlay;
                padding-top: 1px;
              }
              
              .favorite-queries-key {
                cursor: pointer;
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-left: 1px;
                margin-right: 1px;
                margin-bottom: 1px;
                padding: 5px;
              }
              
              .favorite-queries-key:hover {
                color: var(--vscode-list-activeSelectionForeground) !important;
                background-color: var(--vscode-list-activeSelectionBackground) !important;
              }
              
              .favorite-queries-key.selected {
                color: var(--vscode-list-activeSelectionForeground);
                background-color: var(--vscode-list-activeSelectionBackground);
                outline: 1px solid
                  var(
                    --vscode-list-focusAndSelectionOutline,
                    var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline))
                  );
              }
              
              .favorite-queries-value {
                width: 70%;
                padding: 10px;
                overflow: scroll;
                font-family: "SF Mono", Monaco, Menlo, Courier, monospace;
                color: var(--vscode-editor-foreground);
                background-color: var(--vscode-editor-background);
                resize: none;
              }
              
              .favorite-query-buttons {
                display: flex;
                justify-content: space-between;
                width: 100%;
                margin-top: 20px;
                flex-wrap: wrap;
                gap: 20px;
              }
              
              .favorite-query-copy-button,
              .favorite-query-delete-button,
              .favorite-query-paste-button {
                flex: 1;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                text-align: center;
                transition: background-color 0.3s ease-in-out;
                max-width: 80px;
              }
              
              .favorite-query-copy-button {
                background-color: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
              }
              
              .favorite-query-copy-button:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
              }
              
              .favorite-query-delete-button {
                background-color: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
              }
              
              .favorite-query-delete-button:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
              }
              
              .favorite-query-paste-button {
                background: #ea2328;
                color: #eee;
              }
              
              .favorite-query-paste-button:hover {
                background: #bb1117;
              }
          </style>

       </head>
       <body>
            <div class="favorite-queries-container">
                <div class="favorite-queries-table">
                    <div class="favorite-queries-keys">
                        <div class="favorite-queries-keys-header">Keys</div>
                        <div class="favorite-queries-key-container">
                            ${favQueries !== undefined && favQueries.map((kv, index) => {
                                return (`<div class="favorite-queries-key" onClick="openQuery('${index}')">${kv.key}</div>`);
                            }).join('')}
                        </div>
                    </div>
                    
                    <textarea class="favorite-queries-value" disabled>No Query Selected</textarea>
                </div>
                <div class="favorite-query-buttons">
                    <div class="favorite-query-paste-button" id="favorite-query-paste-button" onClick="pasteQuery()">
                        Paste
                    </div>
                    <div class="favorite-query-copy-button" id="favorite-query-copy-button" onClick="copyQuery()">
                        Copy
                    </div>
                    <div class="favorite-query-delete-button" id="favorite-query-delete-button" onClick="deleteQuery()">
                        Delete
                    </div>
                </div>

            </div>
        </body>
        <script>
        const vscode = acquireVsCodeApi();
        document.getElementById("favorite-query-paste-button").disabled = true;
            function openQuery(index) {
                let favQueries = ${JSON.stringify(favQueries)};
                let queryKey = favQueries[index].key;
                let queryValue = favQueries[index].value;
                document.querySelector(".favorite-queries-value").innerHTML = queryValue;
                document.querySelector(".favorite-queries-value").id = queryKey;
                document.getElementById("favorite-query-paste-button").disabled = false;
            }

            function pasteQuery(){
                if(document.getElementById("favorite-query-paste-button").disabled){
                    vscode.postMessage({
                        command: 'vscode-couchbase.queryNotSelected'
                    });
                    return;
                }
                let query = document.querySelector(".favorite-queries-value").innerHTML;
                vscode.postMessage({
                    command: 'vscode-couchbase.pasteQuery',
                    query: query,
                });
            }

            function copyQuery(){
                if(document.getElementById("favorite-query-paste-button").disabled){
                    vscode.postMessage({
                        command: 'vscode-couchbase.queryNotSelected'
                    });
                    return;
                }
                let query = document.querySelector(".favorite-queries-value").innerHTML;
                navigator.clipboard.writeText(query);
            }

            function deleteQuery(){
                if(document.getElementById("favorite-query-paste-button").disabled){
                    vscode.postMessage({
                        command: 'vscode-couchbase.queryNotSelected'
                    });
                    return;
                }
                let key = document.querySelector(".favorite-queries-value").id;
                let query = document.querySelector(".favorite-queries-value").innerHTML;
                vscode.postMessage({
                    command: 'vscode-couchbase.deleteQuery',
                    id: key,
                    query: query,
                });
            }

            const keys = document.querySelectorAll('.favorite-queries-key');
            keys.forEach((key) => {
                key.addEventListener('click', () => {
                    keys.forEach((k) => {
                        k.classList.remove('selected');
                    });
                    key.classList.add('selected');
                });
            });

        </script>
    </html>
    `;
};