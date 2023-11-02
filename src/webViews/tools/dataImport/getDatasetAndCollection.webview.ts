export const getDatasetAndCollection = async (
    buckets: string[],
    prefilledData: any,
    keysAndAdvancedSettingsData: any
): Promise<string> => {
    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Data Import</title>
          <style>
            .heading {
                text-align: center;
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

            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }

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

            input[type="text"]{
                width: 99%;
                padding-top: 8px;
                padding-bottom: 8px;
                margin-bottom: 15px;
                border: 1px solid var(--vscode-settings-sashBorder);
                border-radius: 3px;
                font-size: 16px;
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
                border-top: 1px solid var(--vscode-settings-sashBorder);
            }

            .dataset-container {
                display: flex; 
                align-items: start;
            }
            
            .dataset-destination {
                padding: 11px;
                background-color: #007bff;
                color: #fff;
                cursor: pointer;

                white-space: nowrap;
            }
            
            .dataset-destination:hover {
                background-color: #0056b3;
            }
            
            #selectedFile {
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

            /* Style for the submit button */
            input[type="submit"] {
                
                color: var(--vscode-button-foreground);
                border: none;
                padding: 10px 50px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                margin-left: auto;
                margin-top: 20px;
            }
            .redButton{
                background: #ea2328;
            }
            .redButton:hover {
                background: #bb1117;
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
            <h1 class="heading">Import Data</h1>
            <form action="#" method="post" id="dataImportForm">
                <h4 >Before proceeding do checkout <a href="https://docs.couchbase.com/server/current/tools/cbimport.html">Couchbase docs</a> for CB Import</h4>
                <div class="separator-container">
                    <span class="separator-text">Dataset</span>
                    <div class="separator"></div>
                </div>

                <label for="dataset-destination" class="tooltip">Select the Dataset (CSV or JSON format): 
                    <span class="tooltiptext">Select the file containing the data to import. The file must be in either JSON or CSV format.</span>
                </label>
                
                <div class="dataset-container">
                    <div class="dataset-destination redButton" id="datasetDestination" onclick="getDatasetFile()">Choose</div>
                    <input type="text" id="selectedFile" name="selectedFile" readonly>
                </div>
                <br>

                <div class="separator-container">
                    <span class="separator-text">Target Location</span>
                    <div class="separator"></div>
                </div>

                <label for="bucket" class="tooltip">Bucket:
                    <span class="tooltiptext">Select the bucket where you want to import the data.</span>
                </label>
                <select name="bucket" id="bucket" onchange="onBucketClick(value)">
                    ${buckets.map((bucketName, index) => {
                        return `
                            <option value="${bucketName}" ${
                            index === 0 && "selected"
                        }>${bucketName}</option>
                        `;
                    })}
                </select>
                <br>
                
                <label for="scopesAndCollections" class="tooltip">Scopes And Collections:
                    <span class="tooltiptext">Select the scope and collection where you want to import the data. You can choose to import into the default scope and collection, a specific collection, or dynamically determine the scope and collection based on the data.</span>
                </label>
                <select name="scopesAndCollections" id="scopesAndCollections" onchange="onScopeAndCollectionsClick(value)" width="100%">
                    <option value="defaultCollection" selected>Default scope and collection</option>
                    <option value="SpecifiedCollection">Choose a specified collection </option>
                    <option value="dynamicCollection">Enter dynamic scope and collection</option>
                </select>
                <br>

                <!-- If person wants to choose simple scope and collection dropdown picker -->
                <div id="specifiedCollectionContainer" hidden>
                    <label for="scopesDropdown" class="tooltip">Scope:
                        <span class="tooltiptext">Select the scope where you want to import the data.</span>
                    </label>
                    <select name="scopesDropdown" id="scopesDropdown" onchange="onScopesDropdownClick(value, selectedIndex)" width="100%"></select>
                    <br>

                    <label for="collectionsDropdown" class="tooltip">Collection:
                        <span class="tooltiptext">Select the collection where you want to import the data.</span>
                    </label>
                    <select name="collectionsDropdown" id="collectionsDropdown" width="100%"></select>
                    <br>
                </div>

                <!-- Dynamic Scopes and Collections -->
                <div id="dynamicCollectionContainer" hidden>
                    <label for="scopesDynamicField" class="tooltip">Scope Field:
                        <span class="tooltiptext">Specify the field in the data that contains the scope name.<br>
                            To use information from the JSON document, specify the column name between % characters. 
                            For example, --scope-collection-exp %scope_field%.%collection_field%. 
                            Fields that contain a % character may be escaped using %%.<br>
                            For more information about the accepted format, see the 
                            <a href="https://docs.couchbase.com/server/current/tools/cbimport-json.html#scopecollection-parser">SCOPE/COLLECTION PARSER</a> section
                        </span>
                    </label>
                    <input type="text" name="scopesDynamicField" id="scopesDynamicField" value="" placeholder="%cbms%">
                    <br>

                    <label for="collectionsDynamicField" class="tooltip">Collection Field:
                    <span class="tooltiptext">Specify the field in the data that contains the collection name.<br>
                        To use information from the JSON document, specify the column name between % characters. 
                        For example, --scope-collection-exp %scope_field%.%collection_field%. 
                        Fields that contain a % character may be escaped using %%.<br>
                        For more information about the accepted format, see the 
                        <a href="https://docs.couchbase.com/server/current/tools/cbimport-json.html#scopecollection-parser">SCOPE/COLLECTION PARSER</a> section
                    </span>
                    </label>
                    <input type="text" name="collectionsDynamicField" id="collectionsDynamicField" value="" placeholder="%cbmc%">
                    <br>
                </div>

                <div class="validation-error" id="validation-error"></div>

                <input type="submit" value="Next" onclick="onNextClick(event)" class="redButton">
            </form>
        </body>
        <script>
        const vscode = acquireVsCodeApi();
        let scopesSpecData = [];

        function onBucketClick(bucketId) {
            document.getElementById('scopesDropdown').setAttribute('disabled',"");
            document.getElementById('collectionsDropdown').setAttribute('disabled',"");
            
            vscode.postMessage({
                command: 'vscode-couchbase.tools.dataImport.getScopes',
                bucketId: bucketId
            });
        }

        async function setInitialValue(fieldId, value) {
            const field = document.getElementById(fieldId);
            
            if (field && value && value.trim() !== "") {
                field.value = value;
                if(fieldId === "scopesAndCollections" || fieldId === "scopesDropdown") {
                    field.dispatchEvent(new Event('change'));
                }
            }
        }

        window.onload = async function() {
            // Load all the data present in prefilled
            let prefilledData = ${JSON.stringify(prefilledData)};
            if(prefilledData){
                setInitialValue('selectedFile', prefilledData.dataset);
                scopesSpecData = prefilledData.scopesSpecData;
                if(prefilledData.bucket && prefilledData.bucket.trim !== ""){
                    setInitialValue('bucket', prefilledData.bucket);
                } else {
                    const selectElement = document.getElementById('bucket');
                    if (selectElement && selectElement.options.length > 0) {
                        const firstOptionValue = selectElement.value;
                        onBucketClick(firstOptionValue);
                    }
                }
                setInitialValue('scopesAndCollections', prefilledData.scopesAndCollections);
                createScopesDropdown(scopesSpecData);
                setInitialValue('scopesDropdown', prefilledData.scopesDropdown);
                setInitialValue('collectionsDropdown', prefilledData.collectionsDropdown);
                setInitialValue('scopesDynamicField',prefilledData.scopesDynamicField);
                setInitialValue('collectionsDynamicField',prefilledData.collectionsDynamicField);

                // After the prefill, we can reset the prefilled data so that it does not interfere anymore
                ${prefilledData = undefined};
            } else {
                // We want scopeDetails for 1st bucket so calling the function on load of the webview
                const selectElement = document.getElementById('bucket');
                if (selectElement && selectElement.options.length > 0) {
                    const firstOptionValue = selectElement.value;
                    onBucketClick(firstOptionValue);
                }
            }
        };

        function getDatasetFile(){
            vscode.postMessage({
                command: 'vscode-couchbase.tools.dataImport.getDatasetFile'
            });
        }

        function onScopeAndCollectionsClick(value) {
            document.getElementById('specifiedCollectionContainer').setAttribute('hidden',"");
            document.getElementById('dynamicCollectionContainer').setAttribute('hidden',"");

            if(value === "SpecifiedCollection"){
                document.getElementById('specifiedCollectionContainer').removeAttribute('hidden');
            } else if(value === "dynamicCollection") {
                document.getElementById('dynamicCollectionContainer').removeAttribute('hidden');
            }
        }

        function onScopesDropdownClick(scopeName, index) {
            document.getElementById('collectionsDropdown').setAttribute('disabled',"");
            const collectionDropdown = document.getElementById('collectionsDropdown');
            collectionDropdown.innerHTML = '';
            // Add a default option of select a scope
            const option = document.createElement('option');
            option.value = "";
            option.text = "Select a collection"
            option.setAttribute("disabled","");
            option.setAttribute("selected","");
            collectionDropdown.appendChild(option);

            const scopeDetails = scopesSpecData[index-1]; // Index - 1 as default as indexing of scopes start at 1;
            for(let collection of scopeDetails.collections){
                const collectionOption = document.createElement('option');
                collectionOption.value = collection.name;
                collectionOption.text = collection.name;
                collectionDropdown.appendChild(collectionOption);
            }
                
            document.getElementById('collectionsDropdown').removeAttribute('disabled');
        }

        function createScopesDropdown(scopesData){
            const scopeDropdown = document.getElementById('scopesDropdown');
                
            // Clear existing options in the scope dropdown
            scopeDropdown.innerHTML = '';

            // Add a default option of select a scope
            const option = document.createElement('option');
            option.value = "";
            option.text = "Select a scope"
            option.setAttribute("disabled","");
            option.setAttribute("selected","");
            scopeDropdown.appendChild(option);

            // Add scope options
            scopesData.forEach((scope) => {
                const option = document.createElement('option');
                option.value = scope.name;
                option.text = scope.name;
                scopeDropdown.appendChild(option);
            });
            scopeDropdown.removeAttribute('disabled');
        }

        window.addEventListener('message', event => {
            const message = event.data; // The JSON data our extension sent

            switch (message.command) {
                case 'vscode-couchbase.tools.dataImport.scopesInfo':
                    const scopesData = message.scopes;
                    scopesSpecData = scopesData;
                    createScopesDropdown(scopesData);
                    break;
                case 'vscode-couchbase.tools.dataImport.datasetFile':
                    const dataset = message.dataset;
                    document.getElementById("selectedFile").value = dataset;
                    break;
                case "vscode-couchbase.tools.dataImport.getDatasetAndCollectionPageFormValidationError":
                    const error = message.error;
                    document.getElementById("validation-error").innerHTML = message.error;
                    break;
                case "vscode-couchbase.tools.dataImport.defaultScopeAndCollectionDynamicField":
                    const defaultScopeValue = message.defaultScopeValue;
                    const defaultCollectionValue = message.defaultCollectionValue;
                    document.getElementById("scopesDynamicField").value = defaultScopeValue;
                    document.getElementById("collectionsDynamicField").value = defaultCollectionValue;
                    break;
            }
        });

        function onNextClick(event) {
            event.preventDefault(); // prevent form submission

            // Get values from the form
            const dataset = document.getElementById('selectedFile').value;
            const bucket = document.getElementById('bucket').value;
            const scopesAndCollections = document.getElementById('scopesAndCollections').value;
            let scopesDropdown, collectionsDropdown, scopesDynamicField, collectionsDynamicField;
            let scopeCollectionExpression = "_default._default"; // Default case of default values

            // Check which option is selected in the "Scopes And Collections" dropdown
            if (scopesAndCollections === 'SpecifiedCollection') {
                scopesDropdown = document.getElementById('scopesDropdown').value;
                collectionsDropdown = document.getElementById('collectionsDropdown').value;
                scopeCollectionExpression = scopesDropdown+"."+collectionsDropdown; //The value of collections dropdown already has scope data
            } else if (scopesAndCollections === 'dynamicCollection') {
                scopesDynamicField = document.getElementById('scopesDynamicField').value;
                collectionsDynamicField = document.getElementById('collectionsDynamicField').value;
                scopeCollectionExpression = scopesDynamicField + '.' + collectionsDynamicField;
            }

            // Consolidate data
            const formData = {
                dataset,
                bucket,
                scopesAndCollections,
                scopesDropdown,
                collectionsDropdown,
                scopesDynamicField,
                collectionsDynamicField,
                scopesSpecData,
                scopeCollectionExpression
            };
            vscode.postMessage({
                command: 'vscode-couchbase.tools.dataImport.nextGetDatasetAndCollectionPage',
                data: formData,
                keysAndAdvancedSettingsData: ${JSON.stringify(
                    keysAndAdvancedSettingsData
                )}
            });       
        }

        </script>
    </html>
    `;
};
