import * as vscode from 'vscode';
import { IQueryContextWebviewParams } from '../types/IQueryContextWebviewParams';

export const getQueryContext = (webviewParams:IQueryContextWebviewParams) :string => {
   type ScopeDetails = {
      scopeName: string
   };
   type bucketDetails = {
      bucketName: string,
      scopes: ScopeDetails[]
   };
   let buckets: bucketDetails[] = [
      {
         bucketName: "b1",
         scopes: [
            {scopeName: "s1"},
            {scopeName: "s2"}
         ]
      },
      {
         bucketName: "b2",
         scopes: [
            {scopeName: "s1"},
            {scopeName: "s2"}
         ]
      }
   ];
    return `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Query Context</title>
          <link rel="stylesheet" href="${webviewParams.styleSrc}" type="text/css">
          <style>
             h3 {
             display: inline;
             }
          </style>
       </head>
       <body height="100vh">
        <div class="query-context-container"> 
          <div class="query-context-edit"> 
            <div class="query-context-edit-button">
               <img class="query-context-edit-icon" src="${webviewParams.editLogo}" height="30px" width="30px" />
            </div>
            <div class="query-context-view" id="query-context-selected-value">
               No Query Context Selected
            </div>
            
          </div>
          <div class="clear-query-context" id="clear-query-context">
             Clear Context
          </div>
          <div class="query-context-bucket-dropdown">
            <div class="query-context-bucket-button"> Buckets <span></span></div>
            <div class="query-context-bucket-values">
               ${webviewParams.buckets.map((bucket, index)=>{
                 return (`<div class="query-context-bucket-value">
                     ${bucket.name} <span></span>
                     <div class="query-context-scope-dropdown" id="scopeDropdown-${index}">
                        <div class="query-context-scope-values">
                        <div class="query-context-scope-value"> Scopes</div>
                           ${webviewParams.scopes[index].map((scope)=>{
                             return (`
                                 <div class="query-context-scope-value">
                                    ${scope.name}
                                 </div>
                              `);
                           }).join('')}
                        </div>
                     </div>
                  </div>`);
               }).join('')}
            </div>
           </div>
          </div>
        
       </body>
       <script>
            const bucketValues = document.querySelectorAll('.query-context-bucket-value');
            const scopeDropdowns = document.querySelectorAll('.query-context-scope-dropdown');
            bucketValues.forEach((bucketValue, index) => {
               bucketValue.addEventListener('mouseenter', () => {
                  // Hide all scope dropdowns
                  scopeDropdowns.forEach((scopeDropdown) => {
                     scopeDropdown.style.display = 'none';
                  });
                  const scopeDropdown = document.getElementById("scopeDropdown-" +index);
                  if (scopeDropdown) {
                     scopeDropdown.style.display = 'block';
                     const childrenOfScopeDropdown = scopeDropdown.querySelectorAll('.query-context-scope-values');
                     childrenOfScopeDropdown.forEach((child) => {
                        child.style.display = 'block'
                     })
                  }
               });

               bucketValue.addEventListener('mouseleave', () => {
                  const scopeDropdown = document.getElementById("scopeDropdown-" + index);
                  if (scopeDropdown) {
                      scopeDropdown.style.display = 'none';
                  }
              });
            });

            let isDropdownDisplayed = false;

            function toggleBucketValues() {
               const bucketValuesDropdown = document.querySelector('.query-context-bucket-values');
               
               if (isDropdownDisplayed) {
                  // If the dropdown is currently displayed, hide it
                  bucketValuesDropdown.style.display = 'none';
                  isDropdownDisplayed = false;
               } else {
                  // If the dropdown is currently hidden, show it
                  bucketValuesDropdown.style.display = 'block';
                  isDropdownDisplayed = true;
               }
            }

            // Add a click event listener to the button to toggle the display
            document.querySelector('.query-context-bucket-button').addEventListener('click', (event) => {
               // Prevent the event from bubbling up and immediately closing the dropdown
               event.stopPropagation();
               
               // Toggle the display of the bucket values
               toggleBucketValues();
            });

            // Add a click event listener to the document body to hide the dropdown when clicking anywhere else
            document.body.addEventListener('click', () => {
               if (isDropdownDisplayed) {
                  toggleBucketValues();
               }
            });

         </script>
       </html>
    `;
};