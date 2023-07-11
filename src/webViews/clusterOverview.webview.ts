
export function getClusterOverview(overview: any): string {
   return `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${overview}</title>
          <style>
             h3 {
             display: inline;
             }
          </style>
       </head>
       <body>
          <h1>Cluster Connection Information</h1>
       </body>
    </html>`;
}