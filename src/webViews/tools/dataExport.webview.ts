export const dataExportWebview = async (buckets: string[]): Promise<string> => {
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
                border-top: 1px solid var(--vscode-settings-sashBorder);
            }

            form {
                max-width: 400px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ccc;
                background-color: #f9f9f9;
                border-radius: 5px;
            }
            
            /* Style for form labels */
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            
            /* Style for form input fields and selects */
            input[type="text"],
            select,
            input[type="file"] {
                width: 100%;
                padding: 8px;
                margin-bottom: 15px;
                border: 1px solid #ccc;
                border-radius: 3px;
                font-size: 16px;
            }
            
            
            /* Style for the submit button */
            input[type="submit"] {
                background-color: #007BFF;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 18px;
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

            /* Style for the submit button on hover */
            input[type="submit"]:hover {
                background-color: #0056b3;
            }

            .folder-container {
                display: flex;
                align-items: center;
            }
            
            .folder-destination {
                padding: 10px;
                background-color: #007bff;
                color: #fff;
                cursor: pointer;
                border: 1px solid #007bff;
                border-radius: 5px;
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
            
          </style>
        </head>

        <body>
            <h1 class="heading">Export Data</h1>
            <div class="separator-container">
                <span class="separator-text">Target</span>
                <div class="separator"></div>
            </div>
            <form action="#" method="post" id="dataExportForm">
                <label for="bucket">Bucket:</label>
                <select name="bucket" id="bucket" onchange="onBucketClick(value)">
                <option value="" disabled selected>Select a bucket</option>
                    ${buckets.map((bucketName)=>{
                        return `
                            <option value="${bucketName}" >${bucketName}</option>
                        `;
                    })}
                </select>
                <br>

                <label for="scopes">Scopes:</label>
                <select name="scopes" id="scopes" multiple class="js-select2" disabled onchange="onScopeClick(options)"></select>
                <br>

                <label for="collections">Collections:</label>
                <select name="collections" id="collections" multiple class="js-select2" disabled ></select>
                <br>

                <label for="documentsKeyField">Document's Key Field:</label>
                <input type="text" name="documentsKeyField" id="documentsKeyField" value="cbmid">
                <br>

                <label for="scopeFieldName">Scope Field Name:</label>
                <input type="text" name="scopeFieldName" id="scopeFieldName" value="cbms">
                <br>

                <label for="collectionFieldName">Collection Field Name:</label>
                <input type="text" name="collectionFieldName" id="collectionFieldName" value="cbmc">
                <br>

                <label for="format">Format:</label>
                <select name="format" id="format">
                    <option value="list">JSON Array</option>
                    <option value="lines">JSON Lines</option>
                </select>
                <br>

                <label for="fileDestination">File Destination Folder:</label>
                <div class="folder-container">
                    <div class="folder-destination" id="folderDestination" onclick="getFolder()">Choose the folder</div>
                    <input type="text" id="selectedFolder" name="selectedFolder" readonly>
                </div>
                <br>

                <input type="submit" value="Submit" onclick="submitForm(event)">
            </form>
        </body>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
    <script >
        const vscode = acquireVsCodeApi();
        let scopesSpecData = [];
        function onBucketClick(bucketId) {
            document.getElementById('scopes').setAttribute('disabled',"");
            
            vscode.postMessage({
                command: 'vscode-couchbase.tools.dataExport.getScopes',
                bucketId: bucketId
            });
        }

        function getFolder(){
            vscode.postMessage({
                command: 'vscode-couchbase.tools.dataExport.getFolder'
            });
        }

        function onScopeClick(allScopes) {
            let selectedScopes = [];
            let allScopeCnt = allScopes.length;
            for(let i=0;i<allScopeCnt;i++){
                if(allScopes[i].selected === true){
                    if(i===0){
                        selectedScopes.push("all-scopes");
                    } else{
                        selectedScopes.push(scopesSpecData[i-1]); // scopeSpecData is i-1 for eliminating all scopes
                    } 
                }
            }
            if(selectedScopes.includes("all-scopes")){
                // No Collections Required
                document.getElementById('collections').setAttribute('disabled',"");

            } else {
                const collectionsDropdown = document.getElementById('collections');
                collectionsDropdown.innerHTML = '';
                selectedScopes.map((scopeDetails)=>{
                    // All Collections of the scope
                    const selectAllOption = document.createElement('option');
                    selectAllOption.value = 'all-collections-'+scopeDetails.name;
                    selectAllOption.text = 'Select all collections of scope: '+scopeDetails.name;
                    collectionsDropdown.appendChild(selectAllOption);

                    // Individual Collections
                    for(let collection of scopeDetails.collections){
                        const collectionOption = document.createElement('option');
                        collectionOption.value = collection.scopeName + "." + collection.name;
                        collectionOption.text = collection.scopeName + "." + collection.name;
                        collectionsDropdown.appendChild(collectionOption);
                    }
                    
                })
                document.getElementById('collections').removeAttribute('disabled');
            }
        }

        $(document).ready(function() {
            // Initialize Select2 on all dropdowns
            $('.js-select2').select2();
        });

        window.addEventListener('message', event => {
            const message = event.data; // The JSON data our extension sent
        
            switch (message.command) {
                case 'vscode-couchbase.tools.dataExport.scopesInfo':
                    let scopesData = message.scopes;
                    scopesSpecData = scopesData;
                    const scopeDropdown = document.getElementById('scopes');
        
                    // Clear existing options in the scope dropdown
                    scopeDropdown.innerHTML = '';
                    const selectAllOption = document.createElement('option');
                    selectAllOption.value = 'all-scopes';
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
                case 'vscode-couchbase.tools.dataExport.folderInfo':
                    let folder = message.folder;
                    console.log(folder);
                    document.getElementById("selectedFolder").setAttribute("value", folder);
            }
        });

        function submitForm(event) {
            event.preventDefault(); // Prevent the form from submitting in the traditional way
        
            // Gather data from form fields
            const bucket = document.getElementById('bucket').value;
            const scopes = Array.from(document.getElementById('scopes').selectedOptions).map(option => option.value);
            const collections = Array.from(document.getElementById('collections').selectedOptions).map(option => option.value);
            const documentsKeyField = document.getElementById('documentsKeyField').value;
            const scopeFieldName = document.getElementById('scopeFieldName').value;
            const collectionFieldName = document.getElementById('collectionFieldName').value;
            const format = document.getElementById('format').value;
            const fileDestination = document.getElementById('selectedFolder').value;
        
            // Consolidate the data into an object
            const formData = {
                bucket,
                scopes,
                collections,
                documentsKeyField,
                scopeFieldName,
                collectionFieldName,
                format,
                fileDestination,
            };
            vscode.postMessage({
                command: 'vscode-couchbase.tools.dataExport.runExport',
                data: formData
            });
        }

        

    </script>
    </html>
    `;
};
