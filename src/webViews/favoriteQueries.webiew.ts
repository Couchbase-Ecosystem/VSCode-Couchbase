import { IFavoriteQueriesWebviewParams } from "../pages/FavoriteQueries/FavoriteQueries";
import { getFavoriteQueries } from "../util/favoriteQuery";

export const showFavoriteQueries = (vscodeURIs: IFavoriteQueriesWebviewParams): string => {
    let favQueries = getFavoriteQueries();

    return `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="${vscodeURIs.styleSrc}" type="text/css">
          <title>Query Context</title>
          <style>
             h3 {
             display: inline;
             }
          </style>
       </head>
       <body>
            <div class="favorite-queries-container">
                <div class="favorite-queries-table">
                    <div class="favorite-queries-keys">
                        <div class="favorite-queries-keys-header">Keys</div>
                        <div class="favorite-queries-key-container">
                            ${favQueries !== undefined && favQueries.map((kv, index)=>{
                                return (`<div class="favorite-queries-key" onClick="openQuery('${index}')">${kv.key}</div>`);
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="favorite-queries-value">
                        No Query Selected
                    </div>
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
                    vscode.window.showErrorMessage("Please select a query");
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
                    return;
                }
                let query = document.querySelector(".favorite-queries-value").innerHTML;
                navigator.clipboard.writeText(query);
            }

            function deleteQuery(){
                if(document.getElementById("favorite-query-paste-button").disabled){
                    return;
                }
                let key = document.querySelector(".favorite-queries-value").id;
                vscode.postMessage({
                    command: 'vscode-couchbase.deleteQuery',
                    id: key,
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