export const getLoader = (): string => {
    return `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Loading</title>
          <style>
            * {
                margin: 0;
            }
            
            body {
                position: absolute;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                top: 40%;
                left: 20%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            h1 {
                text-align: center;
                font-family: "Heebo", sans-serif;
                font-weight: 100;
                margin: 10px 20px 0 0;
                font-size: 18px;
                margin-bottom: 10px;
            }
            
            .progress-bar {
                position: relative;
                height: 10px;
                width: 200px;
                background-color: var(--vscode-list-activeSelectionBackground);
                border: 1px solid var(--vscode-list-activeSelectionBackground);
                border-radius: 25px;
            }
            
            .progress-fill {
                position: absolute;
                height: 10px;
                width: 0%;
                animation: progress-forward 300s infinite cubic-bezier(0,.4,0,1);
                background: var(--vscode-list-activeSelectionForeground);
                border-radius: 15px;
            }
            
            @keyframes progress-forward {
                from { 
                    width: 0%;
                  }
                  to {
                    width: 99%;
                  }
            } ;
            
          </style>
        </head>
        <body>
            <h1>LOADING</h1>
            <div class="progress-bar">
            <div class="progress-fill"></div>
            </div>
            <img src="" alt="">
        </body>
    </html>
    
    `;
};