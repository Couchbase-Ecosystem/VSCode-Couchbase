import { getFavoriteQueries } from "../util/favoriteQuery";

export const showFavoriteQueries = (): string => {
    let favQueries = getFavoriteQueries();
    let pasteQueryts =  (query: string)=>{

    };
    return `
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
          </style>
       </head>
       <body>
            <div class="favorite-queries-container">
                <div class="favorite-queries-table">

                    <div class="favorite-queries-keys">
                        ${favQueries !== undefined && favQueries.map((kv)=>{
                            return (`<div class="favorite-queries-keys" onClick="openQuery('${kv.value}')">${kv.key}</div>`);
                        }).join('')}
                    </div>
                    <div class="favorite-queries-value">
                    </div>
                </div>
                <div class="favorite-query-paste-button" onClick="pasteQuery()">
                    Paste
                </div>

            </div>
        </body>
        <script>
            function openQuery(queryValue) {
                document.querySelector(".favorite-queries-value").innerHTML = queryValue;
            }

            function pasteQuery(){
                let query = document.querySelector(".favorite-queries-value").innerHTML;
                ${pasteQueryts(`query`)}
            }
        </script>
    </html>
    `;
};