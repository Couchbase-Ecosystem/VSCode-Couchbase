import { IBucket } from "../model/IBucket";
// Function to convert camel case to normal
const camelToNormal = (camel: string) =>
  camel.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

/*
* function getBucketMetaData that returns an HTML string containing metadata
* information about a "bucket" (the metadata information 
* is passed to the function as an object result of type IBucket).
*/
export function getBucketMetaData(result: IBucket) {
  return `
  <!DOCTYPE html>
  <html lang="en">
     <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${result.name}</title>
        <style>
           h3 {
           display: inline;
           }
        </style>
     </head>
     <body>
        <h1>Bucket Administrative Information</h1>
        <table style="border: 1px solid black;">
           <tr>
              <th style="background-color: gray; padding: 10px; font-size: larger;">
                 <h3>Property</h3>
              </th>
              <th style="background-color: gray; padding: 10px; font-size: larger;">
                 <h3>Value</h3>
              </th>
           </tr>
           <tr>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">Name</td>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">${
                 result.name
                 }
              </td>
           </tr>
           <tr>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">Type</td>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">${camelToNormal(
                 result.bucketType
                 )}
              </td>
           </tr>
           <tr>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">Bucket RAM Quota</td>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">${
                 result.ramQuotaMB
                 } MiB
              </td>
           </tr>
           <tr>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">Replicas</td>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">${
                 result.numReplicas
                 }
              </td>
           </tr>
           <tr>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">Ejection Method</td>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">${camelToNormal(
                 result.evictionPolicy
                 )}
              </td>
           </tr>
           <tr>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">Compression</td>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">${camelToNormal(
                 result.compressionMode
                 )}
              </td>
           </tr>
           <tr>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">Storage Backend</td>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">${camelToNormal(
                 result.storageBackend
                 )}
              </td>
           </tr>
           <tr>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">Minimum Durability Level</td>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">
                 <script>
                    switch (${result.minimumDurabilityLevel}) {
                      case 0:
                        document.write("None");
                        break;
                      case 1:
                        document.write("Replicate to Majority");
                        break;
                      case 2:
                        document.write("Majority and Persist to Active");
                        break;
                      case 3:
                        document.write("Persist to Majority");
                      default: 
                        document.write("Unknown");
                    }
                 </script>
              </td>
           </tr>
           <tr>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">Flush Enabled</td>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">${
                 result.flushEnabled
                 }
           <tr>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">Replica View Indexes</td>
              <td style="border: 1px solid black; padding: 10px; font-size: larger;">${
                 result.replicaIndexes
                 }
              </td>
           </tr>
        </table>
     </body>
  </html>`;
}
