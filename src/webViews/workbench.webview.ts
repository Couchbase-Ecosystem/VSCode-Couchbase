export function getQueryWorkbench(): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <title>Couchbase - New Workbench Feature Coming Soon</title>
            <style>
            body {
                display: flex;
                align-items: center;
                justify-content: center;
                background-image: linear-gradient(to bottom, white 75%, #FC9C0C 25%);
                background-repeat: no-repeat;
                background-attachment: fixed;
                overflow: hidden;
            }
            .container {
                margin-top: 180px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            h1 {
                font-size: 62px;
                color: black;
                margin-bottom: 20px;
            }
            h3 {
                font-size: 32px;
                color: black;             
            }
            p {
                font-size: 24px;
                margin-bottom: 40px;
                color: black;
            }
            </style>
        </head>
        <body>
            <div class="container">
            <img src="https://www.couchbase.com/wp-content/uploads/2022/08/CB-logo-R_B_B.png" alt="New Workbench Feature Coming Soon"/> <br/><br/>
            <h1>A New Workbench Feature Is Coming Soon</h1>
            <br/>
            <h3>Stay Tuned!</h3>
            </div>
        </body>
        </html>    
     `;
}