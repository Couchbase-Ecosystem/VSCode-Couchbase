export const ddlExportWebview = async (buckets: string[]): Promise<string> => {
    return `
      <!DOCTYPE html>
      <html lang="en">
         <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Data Export</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" rel="stylesheet">
        </head>
            <style>
              .heading {
                  text-align: center;
              }
              .advanced-header {
                  font-size: 16px;
                  font-weight: bold;
                  margin-bottom: 5px;
              }
              form {
                  max-width: 500px;
                  margin: 0 auto;
                  padding: 30px;
                  border: 1px solid var(--vscode-settings-sashBorder);
                  background-color: var(--vscode-sideBar-background);
                  color: var(--vscode-sideBar-foreground)
                  border-radius: 5px;
              }
              
              /* Style for form labels */
              label {
                  display: block;
                  margin-bottom: 5px;
                  font-weight: bold;
              }
              .includeIndexesContainer {
                  display: flex;
                  gap: 10px;
              }
              input[type="checkbox"] {
                  transform: scale(1.1); 
              }
              input[type="text"], input[type="number"]{
                  width: 99%;
                  padding-top: 8px;
                  padding-bottom: 8px;
                  margin-bottom: 15px;
                  border: 1px solid var(--vscode-settings-sashBorder);
                  border-radius: 3px;
                  font-size: 16px;
              }
              
              /* Style for form input fields and selects */
              select,
              input[type="file"] {
                  width: 100%;
                  padding-top: 8px;
                  padding-bottom: 8px;
                  margin-bottom: 15px;
                  border: 1px solid var(--vscode-settings-sashBorder);
                  border-radius: 3px;
                  font-size: 16px;
                  color: #444;
              }
              
              /* Style for the submit button */
              input[type="submit"] {
                  
                  color: var(--vscode-button-foreground);
                  border: none;
                  padding: 10px 50px;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 18px;
                  display: flex;
                  margin: auto;
              }
              
              .select2-selection--multiple:before {
                  content: "";
                  position: absolute;
                  right: 7px;
                  top: 42%;
                  border-top: 5px solid #888;
                  border-left: 4px solid transparent;
                  border-right: 4px solid transparent;
              }
              .select2-container--open .select2-selection--multiple:before {
                  border-top:0; border-bottom: 5px solid #888; 
              }
              .select2 {
                  width: 100%; /* Set the select element to 100% of its container's width */
                  max-width: 100%; /* Limit the maximum width to the container's width */
                  box-sizing: border-box; /* Include padding and border in the width */
                  margin-bottom: 15px;
                  color: #444;
              }
              .select2-container--default.select2-container--disabled .select2-selection--multiple {
                  background-color: #ccc;
              }
              
              .folder-container {
                  display: flex; 
                  align-items: start;
              }
              
              .folder-destination {
                  padding: 11px;
                  background-color: #007bff;
                  color: #fff;
                  cursor: pointer;
                  white-space: nowrap;
              }
              
              .folder-destination:hover {
                  background-color: #0056b3;
              }
              
              #selectedFolder {
                  flex-grow: 1;
                  margin-left: 10px;
                  padding: 10px;
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  background-color: #f9f9f9;
              }
              .validation-error {
                  color: #ff0000;
                  font-size: 14px;
                  padding: 5px;
              }
              .select2-results__option {
                  color: #444;
              }
              .collapsible {
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  margin-top: 10px;
              }
              
              .collapsible-header {
                  background-color: #f0f0f0;
                  padding: 10px;
                  cursor: pointer;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
              }
              
              .arrow {
                  width: 0;
                  height: 0;
                  border-left: 5px solid transparent;
                  border-right: 5px solid transparent;
                  border-top: 5px solid #333; /* Arrow icon */
              }
              
              .collapsible-content {
                  display: none;
                  padding: 10px;
              }
              .redButton{
                  background: #ea2328;
              }
              .redButton:hover {
                  background: #bb1117;
              }
              input[type="checkbox"] {
                appearance: none;
                -webkit-appearance: none;
                width: 15px;
                height: 15px;
                border-radius: 2px;
                outline: none;
                border: 1px solid #999;
                background-color: white;
            }
            
            input[type="checkbox"]:checked {
                background-color: #ea2328;
            }
    
            input[type="checkbox"]:checked::before {
                content: '\\2714';
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 12px;
                color: white;
                height: 100%;
            }
              
            </style>
          </head>
          <body>
              <h1 class="heading">DDL Export</h1>
              <form action="#" method="post" id="ddlExport">
                  <label for="bucket">Bucket:</label>
                  <select name="bucket" id="bucket" onchange="onBucketClick(value)">
                  <option value="" disabled selected>Select a bucket</option>
                      ${buckets.map((bucketName) => {
                            return `
                              <option value="${bucketName}" >${bucketName}</option>
                          `;
                    })}
                  </select>
                  <br>
                  <label for="scopes">Scopes:</label>
                  <select name="scopes" id="scopes" multiple class="js-select2" disabled onchange="onScopeClick(options)" width="100%"></select>
                  <br>
                  <div class="includeIndexesContainer">
                  <label for="includeIndexes" id="includeIndexesLabel">Include Indexes:</label>
                  <input type="checkbox" name="includeIndexes" id="includeIndexes">
                    </div>
                  <br>
                  <label for="fileDestination">File Destination Folder:</label>
                  <div class="folder-container">
                      <div class="folder-destination redButton" id="folderDestination" onclick="getFolder()">Choose</div>
                      <input type="text" id="selectedFolder" name="selectedFolder" readonly>
                  </div>
                  <br>
                  <div class="validation-error" id="validation-error"></div>
                  <input type="submit" value="Export" onclick="submitForm(event)" class="redButton">
              </form>
          </body>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
      <script>
          const vscode = acquireVsCodeApi();
          let scopesSpecData = [];
          function onBucketClick(bucketId) {
              document.getElementById('scopes').setAttribute('disabled',"");
              
              vscode.postMessage({
                  command: 'vscode-couchbase.tools.DDLExport.getScopes',
                  bucketId: bucketId
              });
          }
          function getFolder(){
              vscode.postMessage({
                  command: 'vscode-couchbase.tools.DDLExport.getFolder'
              });
          }
          function onScopeClick(allScopes) {
              let selectedScopes = [];
              const allScopeCnt = allScopes.length;
              for(let i=0;i<allScopeCnt;i++){
                  if(allScopes[i].selected === true){
                      if(i===0){
                          selectedScopes.push("All Scopes");
                      } else{
                          selectedScopes.push(scopesSpecData[i-1]); // scopeSpecData is i-1 for eliminating all scopes
                      } 
                  }
              }
          }
          $(document).ready(function() {
              // Initialize Select2 on all dropdowns
              $('.js-select2').select2();
          });
          window.addEventListener('message', event => {
              const message = event.data; // The JSON data our extension sent
          
              switch (message.command) {
                  case 'vscode-couchbase.tools.DDLExport.scopesInfo':
                      const scopesData = message.scopes;
                      scopesSpecData = scopesData;
                      const scopeDropdown = document.getElementById('scopes');
          
                      // Clear existing options in the scope dropdown
                      scopeDropdown.innerHTML = '';
                      const selectAllOption = document.createElement('option');
                      selectAllOption.value = 'All Scopes';
                      selectAllOption.text = 'Select All';
                      scopeDropdown.appendChild(selectAllOption);
                      
                      // Add scope options
                      scopesData.forEach((scope) => {
                          const option = document.createElement('option');
                          option.value = scope.name;
                          option.text = scope.name;
                          scopeDropdown.appendChild(option);
                      });
                      scopeDropdown.removeAttribute('disabled');
                      break;
                  case 'vscode-couchbase.tools.DDLExport.folderInfo':
                      const folder = message.folder;
                      document.getElementById("selectedFolder").setAttribute("value", folder);
                      break;
                  case 'vscode-couchbase.tools.DDLExport.formValidationError':
                      const error = message.error;
                      document.getElementById("validation-error").innerHTML = message.error;
                      break;
              }
          });

          function submitForm(event) {
              event.preventDefault(); // Prevent the form from submitting in the traditional way
              document.getElementById("validation-error").innerHTML = "";
              // Gather data from form fields
              const bucket = document.getElementById('bucket').value;
              const scopes = Array.from(document.getElementById('scopes').selectedOptions).map(option => option.value);
              const fileDestination = document.getElementById('selectedFolder').value;
              const includeIndexes = document.getElementById('includeIndexes').checked;
              // Consolidate the data into an object
              const formData = {
                  bucket,
                  scopes,
                  includeIndexes,
                  fileDestination,
              };
              vscode.postMessage({
                  command: 'vscode-couchbase.tools.DDLExport.runExport',
                  data: formData
              });
          } 
      </script>
      </html>
      `;
};