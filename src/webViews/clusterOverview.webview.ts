import { IClusterOverview } from "../types/IClusterOverview";
import * as vscode from "vscode";
export function getClusterOverview(overview: IClusterOverview, context: vscode.ExtensionContext): string {
   return `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${overview.Title}</title>
          <style>
             h3 {
             display: inline;
             }
          </style>
       </head>
       <body>
          
         <div class="container">
            <div class="sidebar">
               <div class="sidebar-list-container">
                  <div class="sidebar-list-header">
                     Overview
                  </div>
                  <div class="sidebar-list-values-container">
                     <div class="sidebar-list-value" onClick="showContainer('Overview','')">
                        General
                     </div>
                  </div>
               </div>
               <div class="sidebar-list-container">
                  <div class="sidebar-list-header">
                     Nodes
                  </div>
                  <div class="sidebar-list-values-container">
                     ${overview.Nodes?.map((node) =>
                        (`<div class="sidebar-list-value" onClick="showContainer('Node','${node.hostname}')">
                           ${node.hostname}
                        </div>`)).join('')
                     }
                  </div>
               </div>
               <div class="sidebar-list-container">
                  <div class="sidebar-list-header">
                     Buckets
                  </div>
                  <div class="sidebar-list-values-container">
                     ${overview.Buckets?.map((bucket) =>
                     (`<div class="sidebar-list-value" onClick="showContainer('Bucket','${bucket.name}')">
                           ${bucket.name}
                        </div>`)).join('')
                     }
                  </div>
               </div>
               
            </div>
            <div class="main-section">
               <div id="Overview-tab">
                  <div class="general-cluster">
                     ${overview.GeneralDetails?.Cluster?.map((kv) =>
                        (`<div class="field">
                              <div class="field-label">
                                 ${kv.key}
                              </div>
                              <div class="field-value">
                                 ${kv.value}
                              </div>
                          </div>
                        `)).join('')}
                  </div>
                  <div class="separator-container">
                     <span class="separator-text">Quota</span>
                     <div class="separator"></div>
                  </div>
                  <div class="general-quota flex">
                     ${overview.GeneralDetails?.Quota?.map((kv) =>
                        (`<div class="field">
                              <div class="field-label">
                                 ${kv.key}
                              </div>
                              <div class="field-value">
                                 ${kv.value}
                              </div>
                          </div>
                        `)).join('')}
                  </div>
                  <div class="separator-container">
                     <span class="separator-text">RAM</span>
                     <div class="separator"></div>
                  </div>
                  <div class="general-ram flex">
                     ${overview.GeneralDetails?.RAM?.map((kv) =>
                        (`<div class="field">
                              <div class="field-label">
                                 ${kv.key}
                              </div>
                              <div class="field-value">
                                 ${kv.value}
                              </div>
                          </div>
                        `)).join('')}
                  </div>
                  <div class="separator-container">
                     <span class="separator-text">Storage</span>
                     <div class="separator"></div>
                  </div>
                  <div class="general-storage flex">
                     ${overview.GeneralDetails?.Storage?.map((kv) =>
                        (`<div class="field">
                              <div class="field-label">
                                 ${kv.key}
                              </div>
                              <div class="field-value">
                                 ${kv.value}
                              </div>
                          </div>
                        `)).join('')}
                  </div>
               </div>
               <div id="Bucket-tab"> </div>
               <div id="Node-tab"> </div>
            </div>
         </div>
         <style>
            body {
               font-family: Arial, sans-serif;
               margin: 0;
               padding: 0;
            }

            .container {
               display: flex;
               height: 100vh;
            }

            .sidebar {
               background-color: #333377;
               padding: 10px;
               width: 150px;
            }

            .sidebar-list-container {
               margin-bottom: 20px;
            }

            .sidebar-list-header {
               font-weight: bold;
               margin-bottom: 5px;
            }

            .sidebar-list-value {
               cursor: pointer;
               padding: 5px;
            }

            .sidebar-list-value:hover {
               background-color: #eaeaea;
            }

            .main-section {
               background-color: #444444;
               color: white;
               flex: 1;
               padding: 10px;
               maxheight: 100vh;
            }
            .field {
               display: block;
            }
            .field-label {
               display: inline;
               font-weight: 600;
            }
            .field-value {
               display: inline;
               font-weight: 400;
            }
            .separator-container {
               display: flex; /* Use flexbox to align the text and separator horizontally */
               align-items: center; /* Center the items vertically */
               margin: 20px 0; /* Add margin above and below the separator container for spacing */
             }
             
             .separator-text {
               padding-right: 10px; /* Add some spacing between the text and separator */
             }
             
             .separator {
               flex: 1; /* Make the separator expand to fill the remaining space */
               border: none; /* Remove the default border of <hr> element */
               border-top: 1px solid black; /* Add a top border with a solid line */
             }
             .sidebar-list-value{
               display: block;
             }
             .flex {
               display: flex;
             }
         </style>
       </body>
       <script>
       const vscode = acquireVsCodeApi();
       
         function showContainer( header, subheader) {
            if (header === "Overview"){
               
               document.getElementById("Node-tab").hidden = true;
               document.getElementById("Bucket-tab").hidden = true;
               document.getElementById("Overview-tab").hidden = false;
            } else if (header === "Bucket"){
               
               
               document.getElementById("Node-tab").hidden = true;
               document.getElementById("Overview-tab").hidden = true;
               document.getElementById("Bucket-tab").hidden = false;
               let currentBucketHTML = "";
               let buckets = [${overview.BucketsHTML.map((kv)=>{
                  return JSON.stringify(kv);
               })}];
               for (bucket of buckets) {
                  if(bucket.key === subheader){
                     currentBucketHTML = bucket.value
                     break;
                  }
               }
               document.getElementById("Bucket-tab").innerHTML = currentBucketHTML;
               
            } else if (header === "Node") {
               document.getElementById("Bucket-tab").hidden = true;
               document.getElementById("Overview-tab").hidden = true;
               document.getElementById("Node-tab").hidden = false;
               let currentNodeHTML = "";
               let nodes = [${overview.NodesHTML.map((kv)=>{
                  return JSON.stringify(kv);
               })}];
               
               for (node of nodes) {

                  if(node.key === subheader){
                     currentNodeHTML = node.value;
                     break;
                  }
               }
               document.getElementById("Node-tab").innerHTML = currentNodeHTML;
            }
         }
         
       </script>
    </html>`;
}
