import { IClusterOverview } from "../types/IClusterOverview";
import * as vscode from "vscode";
import * as path from "path";
export function getClusterOverview(overview: IClusterOverview, context: vscode.ExtensionContext, styleSrc: vscode.Uri): string {
   return `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${overview.Title}</title>
          <link rel="stylesheet" href="${styleSrc}" type="text/css">
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
                     <div class="sidebar-list-value focussed" id="general-overview" onClick="showContainer('Overview','')">
                     <span class="sidebar-list-value-text">General</span>
                        <span class="tooltip">General</span>
                     </div>
                  </div>
               </div>
               <div class="sidebar-list-container">
                  <div class="sidebar-list-header">
                     Nodes
                  </div>
                  <div class="sidebar-list-values-container">
                     ${overview.Nodes?.map((node, index) =>
                        (`<div class="sidebar-list-value" id="nodes-${index}" onClick="showContainer('Node','${node.hostname}')">
                        <span class="sidebar-list-value-text">${node.hostname}</span>
                           <span class="tooltip">${node.hostname}</span>
                        </div>`)).join('')
                     }
                  </div>
               </div>
               <div class="sidebar-list-container">
                  <div class="sidebar-list-header">
                     Buckets
                  </div>
                  <div class="sidebar-list-values-container">
                     ${overview.Buckets?.map((bucket, index) =>
                     (`<div class="sidebar-list-value" id="buckets-${index}" onClick="showContainer('Bucket','${bucket.name}')">
                           <span class="sidebar-list-value-text">${bucket.name}</span>
                           <span class="tooltip">${bucket.name}</span>
                        </div>`)).join('')
                     }
                  </div>
               </div>
            </div>
            <div class="main-section">
               <div id="Overview-tab">
                  <div class="general-cluster no-flex">
                     ${overview.GeneralDetails?.Cluster?.map((kv, index) =>
                        (`<div class="field" id=general-cluster-${index}">
                              <div class="field-label">
                                 ${kv.key}:
                              </div>
                              <div class="field-value ${kv.key === 'Status' && kv.value === 'healthy' ? 'status-node-value-green' : kv.key === 'Status' && 'status-node-value-red'}">
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
                     ${overview.GeneralDetails?.Quota?.map((kv, index) =>
                        (`<div class="field" id=general-quota-${index}">
                              <div class="field-label">
                                 ${kv.key}:
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
                     ${overview.GeneralDetails?.RAM?.map((kv, index) =>
                        (`<div class="field" id=general-ram-${index}">
                              <div class="field-label">
                                 ${kv.key}:
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
                     ${overview.GeneralDetails?.Storage?.map((kv, index) =>
                        (`<div class="field" id=general-storage-${index}">
                              <div class="field-label">
                                 ${kv.key}:
                              </div>
                              <div class="field-value">
                                 ${kv.value}
                              </div>
                          </div>
                        `)).join('')}
                  </div>
               </div>
               <!-- Below tabs are completely written in ts in overviewCluster -->
               <div id="Bucket-tab"> </div>
               <div id="Node-tab"> </div>
            </div>
         </div>
       </body>
       <script>
       const vscode = acquireVsCodeApi();

       // This is used to focus/defocus a sidebar based on selection
       let allSidebarListItems = Array.from(document.querySelectorAll(".sidebar-list-value"));
         allSidebarListItems.map((item) =>
            item.addEventListener("click", () => {
               deselectAllSidebars(item);
            })
         );
         function deselectAllSidebars(current_target) {
            allSidebarListItems.map((item) => {
               if (current_target !== item) {
                  const togglerBtn = item;
                  togglerBtn.classList.remove("focussed");
               } else {
               const togglerBtn = item;
               togglerBtn.classList.add("focussed");
               }
            });
         }

         // The below code shows the particular container based on the sidebar value chosen
         function showContainer(header, subheader) {
            
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
