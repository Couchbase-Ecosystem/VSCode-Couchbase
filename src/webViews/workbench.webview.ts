export function getQueryWorkbench(): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <title>Couchbase - New Workbench Feature Coming Soon</title>
            <style>
            body {
                background-image: linear-gradient(to bottom, white 50%, #c6d8fd 50%);
                background-repeat: no-repeat;
                background-attachment: fixed;
                height: 100%;
                overflow: hidden;
            }
            .container {
                margin-top: 60px;
                text-align: center;
            }
            h1 {
                font-size: 48px;
                color: black;
                margin-bottom: 20px;
            }
            h3 {
                font-size: 18px;
                color: black;             
            }
            p {
                font-size: 24px;
                margin-bottom: 40px;
                color: black;
            }
            .coder {
                border-radius: 50%;
                box-shadow: 10px 10px 0px #000;
                height: 250px;
                margin: 0 auto 60px;
                width: 290px;
              }
            </style>
        </head>
        <body>
            <div class="container">
            <img src="https://www.couchbase.com/wp-content/uploads/2022/08/CB-logo-R_B_B.png" alt="New Workbench Feature Coming Soon"/>
            <h1>A New Workbench Feature Is Coming Soon</h1>
            <img class="coder" src="https://raw.githubusercontent.com/couchbaselabs/VSCode-Couchbase/DA%23126-Create-Query-Workbench-Coming-Soon/images/coder.png" alt="Coder At Work"/>
            <h1>Coders At Work</h1>
            <br/>
            <h3>Stay Tune</h3>
            </div>
        </body>
        </html>    
     `;
}