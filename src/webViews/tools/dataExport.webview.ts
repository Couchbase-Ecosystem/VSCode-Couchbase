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
                background-color: var(--vscode-button-background);
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

            /* Style for the submit button on hover */
            input[type="submit"]:hover {
                background-color: #0056b3;
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
                border: 1px solid #007bff;
                border-radius: 5px;
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
            
          </style>
        </head>

        <body>
            <h1 class="heading">Export Data</h1>
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
                <select name="scopes" id="scopes" multiple class="js-select2" disabled onchange="onScopeClick(options)" width="100%"></select>
                <br>

                <label for="collections">Collections:</label>
                <select name="collections" id="collections" multiple class="js-select2" disabled width="100%"></select>
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
                    <div class="folder-destination" id="folderDestination" onclick="getFolder()">Choose</div>
                    <input type="text" id="selectedFolder" name="selectedFolder" readonly>
                </div>
                <br>

                <div class="advanced-container">
                    <div class="advanced-header">
                       Advanced Settings
                    </div>
                    <div class="advanced-settings">
                        <label for="threads">Threads</label>
                        <input type="number" name="threads" id="threads" value="4">
                        <br>

                        <div class="verboseLogContainer">
                            <label for="verboseLog" id="verboseLogLabel">Verbose Log:</label>
                            <input type="checkbox" name="verboseLog" id="verboseLog">
                        </div>
                    </div>
                </div>

                <div class="validation-error" id="validation-error"></div>

                <input type="submit" value="Export" onclick="submitForm(event)">
            </form>
        </body>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
    <script>
        const vscode = acquireVsCodeApi();
        let scopesSpecData = [];
        function onBucketClick(bucketId) {
            document.getElementById('scopes').setAttribute('disabled',"");
            document.getElementById('collections').setAttribute('disabled',"");
            
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
            document.getElementById('collections').setAttribute('disabled',"");
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
            if(selectedScopes.includes("All Scopes")){
                // No Collections Required
                document.getElementById('collections').setAttribute('disabled',"");

            } else {
                const collectionsDropdown = document.getElementById('collections');
                collectionsDropdown.innerHTML = '';
                selectedScopes.map((scopeDetails)=>{
                    // All Collections of the scope
                    const selectAllOption = document.createElement('option');
                    selectAllOption.value = 'All '+scopeDetails.name;
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
                case 'vscode-couchbase.tools.dataExport.folderInfo':
                    const folder = message.folder;
                    document.getElementById("selectedFolder").setAttribute("value", folder);
                    break;
                case 'vscode-couchbase.tools.dataExport.formValidationError':
                    const error = message.error;
                    document.getElementById("validation-error").innerHTML = message.error;
                    break;

            }
        });

        function toggleCollapsible(header) {
            const content = header.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        }

        function submitForm(event) {
            event.preventDefault(); // Prevent the form from submitting in the traditional way
            document.getElementById("validation-error").innerHTML = "";
            // Gather data from form fields
            const bucket = document.getElementById('bucket').value;
            const scopes = Array.from(document.getElementById('scopes').selectedOptions).map(option => option.value);
            const collections = Array.from(document.getElementById('collections').selectedOptions).map(option => option.value);
            const documentsKeyField = document.getElementById('documentsKeyField').value;
            const scopeFieldName = document.getElementById('scopeFieldName').value;
            const collectionFieldName = document.getElementById('collectionFieldName').value;
            const format = document.getElementById('format').value;
            const fileDestination = document.getElementById('selectedFolder').value;
            const threads = document.getElementById('threads').value;
            const verboseLog =  document.getElementById('verboseLog').checked;
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
                threads,
                verboseLog
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
