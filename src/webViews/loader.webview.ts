export const getLoader = (header: string): string => {
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
                top: 30%;
                left: 25%;
                width: 50%;
                padding: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            h1 {
                font-family: "Heebo", sans-serif;
                font-weight: 400;
                font-size: 30px;
                margin-bottom: 20px;
            }
            

            .lds-ring {
                display: inline-block;
                position: relative;
                width: 80px;
                height: 80px;
                margin-top: 30px;
              }
              .lds-ring div {
                box-sizing: border-box;
                display: block;
                position: absolute;
                width: 64px;
                height: 64px;
                margin: 8px;
                border: 8px solid #fff;
                border-radius: 50%;
                animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                border-color: #fff transparent transparent transparent;
              }
              .lds-ring div:nth-child(1) {
                animation-delay: -0.45s;
              }
              .lds-ring div:nth-child(2) {
                animation-delay: -0.3s;
              }
              .lds-ring div:nth-child(3) {
                animation-delay: -0.15s;
              }
              @keyframes lds-ring {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
              
            
          </style>
        </head>
        <body>
            <h1>${header} is Loading...</h1>
            <h2>This might take a while, especially for large clusters</h2>
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
            <img src="" alt="">
        </body>
    </html>
    
    `;
};