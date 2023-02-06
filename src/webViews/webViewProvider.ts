export function getBucketMetaData(result: any) {
  let content = "";
  const parseResult = (result: any) => {
    for (let key in result) {
      if (typeof result[key] === "object") {
        content += `<div><b>${key}:</b></div>`;
        parseResult(result[key]);
      } else {
        content += `<p><b>${key}:</b> ${result[key]}</p>`;
      }
    }
  };
  parseResult(result);

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bucket Data</title>
    </head>
    <body>
    <h1>Bucket Details</h1>
      ${content}
    </body>
    </html>`;
}
