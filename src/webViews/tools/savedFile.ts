export const dataMdbMigrateWebview = async (buckets: string[]): Promise<string> => {
    return /*html*/`
      <!DOCTYPE html>
      <html lang="en">
         <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Data Export</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" rel="stylesheet">
            <style>
              .heading {
                  text-align: center;
              }
  
              .advanced-header {
                  font-size: 16px;
                  font-weight: bold;
                  margin-bottom: 5px;
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
  
              .verboseLogContainer {
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
  
              .select2-results__option {
                  color: #444;
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
  
              .redButton{
                  background: #ea2328;
              }
              .redButton:hover {
                  background: #bb1117;
              }
              
              .advanced-header {
                  cursor: pointer;
                  font-weight: bold;
                  padding: 5px;
                  display: flex;
                  align-items: center;
              }
              
              .advanced-settings {
                  display: none;
                  padding: 10px;
              }
              .advanced-settings.active {
                  display: block;
              }
              
              .arrow-icon {
                  transition: transform 0.2s;
                  margin-right:5px;
              }
  
              .tooltip {
                  position: relative;
                  display: inline-block;
              }
  
              .tooltip .tooltiptext {
                  visibility: hidden;
                  width: 400px;
                  background-color: #555;
                  color: #fff;
                  text-align: center;
                  border-radius: 6px;
                  padding: 5px 10px;
                  position: absolute;
                  z-index: 1;
                  bottom: 100%; 
                  left: 50%; 
                  margin-left: -40px; 
                  opacity: 0;
                  transition: opacity 0s;
              }
  
              .tooltip:hover .tooltiptext {
                  visibility: visible;
                  opacity: 1;
              }
              
            </style>
          </head>
  
          <body>
          <h1 class="heading">Data Migration</h1>
          <div>
          
              <!-- MongoDB Connection String Field -->
              <label for="mongoConnectionString">MongoDB Connection String:</label>
              <input type="text" id="mongoConnectionString" name="mongoConnectionString" placeholder="mongodb+srv://your_user:your_password@your_cluster">
              <button type="button" onclick="onConnectionStringClick(document.getElementById('mongoConnectionString').value)">Connect</button>
              <br>
          </div>
                  <br>
  
                  <label for="databases" class="tooltip">Database:
                      <span class="tooltiptext">Select the source database that you want to migrate from.</span>
                  </label>
                  <select name="databases" id="databases" multiple class="js-select2" disabled onchange="onDatabaseClick(document.getElementById('mongoConnectionString').value,document.getElementById('databases').value)" width="100%"></select>
                  <br>
  
                  <label for="collections" class="tooltip">Collections:
                      <span class="tooltiptext">The collections that you would like to include. You can select <strong>All</strong> or more than one option.</span>
                  </label>
                  <select name="collections" id="collections" multiple class="js-select2" disabled width="100%"></select>
                  <br>
  
                  <label for="bucket" class="tooltip">Bucket:
                  <span class="tooltiptext">Select the top level bucket on which export should happen. Only 1 bucket can be exported at a time</span>
              </label>
              <select name="bucket" id="bucket" onchange="onBucketClick(value)">
              <option value="" disabled selected>Select a bucket</option>
                  ${buckets.map((bucketName)=>{
                      return `
                          <option value="${bucketName}" >${bucketName}</option>
                      `;
                  })}
              </select>
              <br>
                <label for="cbScopes" class="tooltip">cbScopes:
                    <span class="tooltiptext">Select the scopes that should be exported, you can also select all scopes which will override any other selection.</span>
                </label>
                <select name="cbScopes" id="cbScopes" multiple class="js-select2" disabled  width="100%"></select>
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
          function onConnectClick(uri){
            vscode.postMessage({
                command: 'vscode-couchbase.tools.mdbExport.connectToMdb',
                connectUri: uri 
            });            
          }
          function onConnectionStringClick(connectionString) {
              document.getElementById('databases').setAttribute('disabled',"");
              document.getElementById('collections').setAttribute('disabled',"");
              
              vscode.postMessage({
                  command: 'vscode-couchbase.tools.mdbExport.getDatabases',
                  connectionString: connectionString
              });
          }
  
          function getFolder(){
              vscode.postMessage({
                  command: 'vscode-couchbase.tools.mdbExport.getFolder'
              });
          }

          function onBucketClick(bucketId) {
            console.log("this gets printed");
            document.getElementById('cbScopes').setAttribute('disabled',"");
            console.log("this gets printed too");
            
            vscode.postMessage({
                command: 'vscode-couchbase.tools.mdbExport.getCbScopes',
                bucketId: bucketId
            });
        }
  
          function onDatabaseClick(connectionString, database) {
              document.getElementById('collections').setAttribute('disabled',"");
              vscode.postMessage({
                command: 'vscode-couchbase.tools.mdbExport.getCollections',
                connectionString: connectionString,
                database: database
            });
              
          }
  
          $(document).ready(function() {
              // Initialize Select2 on all dropdowns
              $('.js-select2').select2();
          });
  
          window.addEventListener('message', event => {
              const message = event.data; // The JSON data our extension sent
          
              switch (message.command) {
                  case 'vscode-couchbase.tools.mdbExport.databaseInfo':
                      const databasesData = message.databases;
                      const databasesDropdown = document.getElementById('databases');
          
                      // Clear existing options in the scope dropdown
                      databasesDropdown.innerHTML = '';
                      
                      // Add database options
                      databasesData.forEach((database) => {
                          const option = document.createElement('option');
                          option.value = database;
                          option.text = database;
                          databasesDropdown.appendChild(option);
                      });
                      databasesDropdown.removeAttribute('disabled');
                      break;
                  case 'vscode-couchbase.tools.mdbExport.scopesInfo':
                    const cbscopesData = message.scopes;
                    cbscopesSpecData = cbscopesData;
                    const cbscopeDropdown = document.getElementById('cbScopes');
        
                    // Clear existing options in the scope dropdown
                    cbscopeDropdown.innerHTML = '';
                    const cbselectAllOption = document.createElement('cboption');
                    cbselectAllOption.value = 'All Scopes';
                    cbselectAllOption.text = 'Select All';
                    cbscopeDropdown.appendChild(cbselectAllOption);
                    console.log(cbscopesData);
                    // Add scope options
                    cbscopeDropdown.innerHTML = '';
                    cbscopesData.forEach((cbscope) => {
                        const option = document.createElement('option');
                        option.value = cbscope.name;
                        option.text = cbscope.name;
                        cbscopeDropdown.appendChild(option);
                    });
                    cbscopeDropdown.removeAttribute('disabled');
                    break;
                  case 'vscode-couchbase.tools.mdbExport.collectionInfo':
                    const collectionsData = message.collection;
                    scopesSpecData = collectionsData;
                    const collectionDropdown = document.getElementById('collections');
        
                    // Clear existing options in the scope dropdown
                    collectionDropdown.innerHTML = '';
                    const selectAllOptionCollection = document.createElement('option');
                    selectAllOptionCollection.value = 'All Collections in the database';
                    selectAllOptionCollection.text = 'Select All';
                    collectionDropdown.appendChild(selectAllOptionCollection);
                    
                    // Add scope options
                    collectionsData.forEach((collection) => {
                        const option = document.createElement('option');
                        option.value = collection;
                        option.text = collection;
                        collectionDropdown.appendChild(option);
                    });
                    collectionDropdown.removeAttribute('disabled');
                    break;
                  case 'vscode-couchbase.tools.mdbExport.formValidationError':
                      const error = message.error;
                      document.getElementById("validation-error").innerHTML = message.error;
                      break;
  
              }
          });
  
          $(document).ready(function () {
              $("#advanced-header").click(function () {
                  $("#advanced-settings").toggleClass("active");
                  const arrowIcon = $(".arrow-icon");
                  arrowIcon.text(arrowIcon.text() === "▶️" ? "▼" : "▶️");
              });
          });
  
          function submitForm(event) {
              event.preventDefault(); // Prevent the form from submitting in the traditional way
              document.getElementById("validation-error").innerHTML = "";
              // Gather data from form fields
              const cbScopes = Array.from(document.getElementById('cbScopes').selectedOptions).map(option => option.value);
              const collections = Array.from(document.getElementById('collections').selectedOptions).map(option => option.value);
              const bucket = document.getElementById('bucket').value;
              const connectionString = document.getElementById('mongoConnectionString').value;
              const databases = document.getElementById('databases').value;

              // Consolidate the data into an object
              const formData = {
                cbScopes,
                  collections,
                  bucket,
                  connectionString,
                  databases
              };
              vscode.postMessage({
                  command: 'vscode-couchbase.tools.mdbExport.runExport',
                  data: formData
              });
          } 
  
      </script>
      </html>
      `;
};