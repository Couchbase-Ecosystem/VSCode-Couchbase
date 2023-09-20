import { IClusterOverview } from "../types/IClusterOverview";
import * as vscode from "vscode";
import * as path from "path";
export function getClusterOverview(overview: IClusterOverview): string {
   return `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${overview.title}</title>
          <style>
             h3 {
             display: inline;
             }
             body {
               font-family: Arial, sans-serif;
               margin: 0;
               padding: 0;
             }
             
             .container {
               display: flex;
               height: 100%;
             }
             
             .sidebar {
               background-color: var(--vscode-activityBar-background);
               color: var(--vscode-activityBar-foreground);
               background-attachment: fixed;
               background-size: 100%;
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
               display: block;
               cursor: pointer;
               padding: 5px;
               position: relative;
               white-space: nowrap;
             }
             
             .sidebar-list-value-text {
               display: block;
               overflow: hidden;
               text-overflow: ellipsis;
             }
             
             .sidebar-list-value:hover {
               color: var(--vscode-list-hoverForeground);
               background-color: var(--vscode-list-hoverBackground);
             }
             
             .sidebar-list-value:hover .tooltip {
               visibility: visible;
               opacity: 1;
             }
             
             .tooltip {
               width: max-content;
               visibility: hidden;
               padding: 3px;
               background-color: #555;
               color: #fff;
               /* text-align: center; */
               padding: 5px;
               border-radius: 6px;
             
               /* Position the tooltip text */
               position: absolute;
               z-index: 1;
               top: 100%;
               left: 50%;
               max-width: 500px;
             
               /* Fade in tooltip */
               opacity: 0;
               transition: opacity 0.3s;
             }
             
             .status-node-value-green {
               color: green;
             }
             .status-node-value-green::first-letter{
               text-transform: capitalize;
             }
             
             .status-node-value-red {
               color: red;
             }
             
             .status-node-value-red::first-letter{
                 text-transform: capitalize;
             }
             
             .focussed {
               color: var(--vscode-list-activeSelectionForeground);
               background-color: var(--vscode-list-activeSelectionBackground);
               outline: 1px solid var(--vscode-list-focusAndSelectionOutline, var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline)));
             }
             
             .focussed:hover {
               color: var(--vscode-list-activeSelectionForeground) !important; 
               background-color: var(--vscode-list-activeSelectionBackground) !important;
               outline: 1px solid var(--vscode-list-focusAndSelectionOutline, var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline))) !important;
             }
             
             .main-section {
               background-color: var(--vscode-editor-background);
               background-size: 100%;
               color: var(--vscode-editor-foreground);
               flex: 1;
               padding: 10px;
               max-height: 100vh;
             }
             .field {
               flex-direction: row;
               align-items: center;
               justify-content: center;
               flex-basis: calc(33.33% - 20px);
               display: flex;
             }
             .field-label {
               display: inline;
               font-weight: 600;
               padding-right: 5px;
               flex-basis: 55%;
               line-height: 2;
             }
             
             
             .field-value {
               bottom: 0;
               flex: 1;
               display: inline;
               font-weight: 400;
               line-height: 2;
             }
             .separator-container {
               display: flex;
               align-items: center;
               margin: 20px 0; 
             }
             
             .separator-text {
               padding-right: 10px;
             }
             
             .separator {
               flex: 1;
               border: none;
               border-top: 1px solid black;
             }
             
             .flex {
               display: flex;
               flex-wrap: wrap;
               justify-content: space-between;
             }
             .no-flex > .field > .field-label{
               flex-basis: 25%;
             }
             
             
             @media screen and (max-width: 1200px) {
               .field {
                 flex-basis: calc(50% - 20px);
               }
               .no-flex > .field > .field-label{
                 flex-basis: 35%;
               }
             }
             
             @media screen and (max-width: 768px) {
               .field {
                 flex-basis: 100%;
               }
               .no-flex > .field > .field-label{
                 flex-basis: 55%;
               }
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
                     ${overview.nodes?.map((node, index) =>
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
                     ${overview.buckets?.map((bucket, index) =>
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
                     ${overview.generalDetails?.cluster?.map((kv, index) =>
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
                     ${overview.generalDetails?.quota?.map((kv, index) =>
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
                     ${overview.generalDetails?.RAM?.map((kv, index) =>
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
                     ${overview.generalDetails?.storage?.map((kv, index) =>
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
               let buckets = [${overview.bucketsHTML.map((kv)=>{
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
               let nodes = [${overview.nodesHTML.map((kv)=>{
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
