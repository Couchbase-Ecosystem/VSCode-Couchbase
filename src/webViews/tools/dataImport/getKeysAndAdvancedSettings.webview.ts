export const getKeysAndAdvancedSettings = (
    datasetAndCollectionData: any,
    prefilledData: any
): string => {
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
                color: var(--vscode-sideBar-foreground);
                border-radius: 5px;
            }

            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }

            select{
                width: 100%;
                padding-top: 8px;
                padding-bottom: 8px;
                margin-bottom: 15px;
                border: 1px solid var(--vscode-settings-sashBorder);
                border-radius: 3px;
                font-size: 16px;
                color: #444;
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

            .validation-error {
                color: #ff0000;
                font-size: 14px;
                padding: 5px;
            }

            .keyPreviewContainer {
                display: flex; 
                align-items: start;
            }
            
            .getKeyPreviewButton {
                padding: 11px;
                background-color: #007bff;
                color: #fff;
                cursor: pointer;

                white-space: nowrap;
            }
            
            .getKeyPreviewButton:hover {
                background-color: #0056b3;
            }

            #keyPreviewTextArea {
                flex-grow: 1;
                margin-left: 10px;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                background-color: #f9f9f9;

                /* Set a fixed size for the textarea */
                width: 99%; /* adjust as needed */
                height: 100px; /* adjust as needed */
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
                margin-top: 20px;
            }
            .buttonsContainer {
                display: flex;
                gap: 25px;
                flex-direction: row-reverse;
            }

            .redButton{
                background: #ea2328;
            }
            .redButton:hover {
                background: #bb1117;
            }

            .secondaryButton {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
            }
            .secondaryButton:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
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
            <h1 class="heading">Import Data</h1>
            <form action="#" method="post" id="dataImportForm">
                <div class="separator-container">
                    <span class="separator-text">Document Key</span>
                    <div class="separator"></div>
                </div>

                <label for="keyOptions" class="tooltip">Key Options: 
                    <span class="tooltiptext">Select how you want to generate the document key for each imported document. You can choose to generate a random UUID, use the value of a field in the data, or generate a custom expression.</span>
                </label>
                <select name="keyOptions" id="keyOptions" onchange="onKeyOptionsClick(value)" width="100%">
                    <option value="random" selected>Generate random UUID for each document</option>
                    <option value="fieldValue">Use the value of field as the key</option>
                    <option value="customExpression">Generate key based on custom expression</option>
                </select>
                <br>

                <div id="fieldNameContainer" hidden>
                    <label for="keyFieldName" class="tooltip">Field name: 
                    <span class="tooltiptext">Specify the field in the data that contains the value to use as the document key.</span>
                </label>
                    <input type="text" name="keyFieldName" id="keyFieldName" value="cbms">
                    <br>
                </div>

                <div id="customExpressionContainer" hidden>
                    <label for="customExpression" class="tooltip">Custom expression: 
                    <span class="tooltiptext">Specify the custom expression to generate the document key.
                        You can use the following variables:
                        <ul style="text-align:left">
                            <li><b>#UUID#</b> - Random UUID</li>
                            <li><b>#MONO_INCR#</b> - Document Numbering starting from 1</li>
                            <li><b>%FIELDNAME%</b> - Value of the field specified above</li>
                        </ul>
                    </span>
                </label>
                    <input type="text" name="customExpression" id="customExpression" value="%cbms%">
                    <br>
                </div>
                <div id="UUID-warn">Note: If random UUID or #UUID# tag is used, the UUID values in the preview area might not match the actual UUID values generated during import.</div>

                <br>
                
                <label for="keyPreview" class="tooltip">Key Preview: 
                    <span class="tooltiptext">Shows the preview of few keys which will be used in document generation. Make sure that keys are different and defined for each document else few documents might fail to import or may get overwritten.</span>
                </label>
                <div class="keyPreviewContainer">
                    <div class="getKeyPreviewButton redButton" id="getKeyPreviewButton" onclick="fetchKeyPreview()">Fetch preview</div>
                    <textarea id="keyPreviewTextArea" readonly value="No Preview to show!"> </textarea>
                </div>
                <br>

                <div class="advanced-container">
                    <div class="advanced-header" id="advanced-header">
                    <span class="arrow-icon">▶️</span>
                        Advanced Settings
                    </div>
                    <div class="advanced-settings" id="advanced-settings">
                        
                        <label for="skipFirstDocuments" class="tooltip">Skip the first # Documents: 
                            <span class="tooltiptext">Specify the number of documents to skip from the beginning of the file.</span>
                        </label>
                        <input type="number" name="skipFirstDocuments" id="skipFirstDocuments" value="">
                        <br>

                        <label for="importUptoDocuments" class="tooltip">Import up to # Documents: 
                            <span class="tooltiptext">Specify the maximum number of documents to import.</span>
                        </label>
                        <input type="number" name="importUptoDocuments" id="importUptoDocuments" value="">
                        <br>
                        
                        <label for="ignoreFields" class="tooltip">Ignore the fields: 
                            <span class="tooltiptext">Specify the fields in the data to ignore.</span>
                        </label>
                        <input type="text" name="ignoreFields" id="ignoreFields" value="">
                        <br>

                        <label for="threads" class="tooltip">Threads 
                            <span class="tooltiptext">Specify the number of threads to use for importing the data.</span>
                        </label>
                        <input type="number" name="threads" id="threads" value="4">
                        <br>
                        <div class="verboseLogContainer">
                            <label for="verboseLog" id="verboseLogLabel" class="tooltip">Verbose Log: 
                            <span class="tooltiptext">Specify whether to enable verbose logging.</span>
                        </label>
                            <input type="checkbox" name="verboseLog" id="verboseLog">
                        </div>
                    </div>
                </div>
                <div class="validation-error" id="validation-error"></div>
                <div class="buttonsContainer">
                    <input type="submit" value="Next" onclick="onNextClick(event)" class="redButton">
                    <input type="submit" value="Back" onclick="onBackClick(event)" class="secondaryButton">
                </div>
            </form>
        </body>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script>
            const vscode = acquireVsCodeApi();
            
            function onKeyOptionsClick(value) {
                document.getElementById('fieldNameContainer').setAttribute('hidden',"");
                document.getElementById('customExpressionContainer').setAttribute('hidden',"");
                document.getElementById('UUID-warn').setAttribute('hidden',"");
                if(value === "random") {
                    document.getElementById('UUID-warn').removeAttribute('hidden',"");
                } else if (value === "fieldValue"){
                    document.getElementById('fieldNameContainer').removeAttribute('hidden');
                } else if (value === "customExpression") {
                    document.getElementById('customExpressionContainer').removeAttribute('hidden');
                    document.getElementById('UUID-warn').removeAttribute('hidden',"");
                }
            }

            $(document).ready(function () {
                $("#advanced-header").click(function () {
                    $("#advanced-settings").toggleClass("active");
                    const arrowIcon = $(".arrow-icon");
                    arrowIcon.text(arrowIcon.text() === "▶️" ? "▼" : "▶️");
                });
            });

            async function setInitialValue(fieldId, value) {
                const field = document.getElementById(fieldId);
                
                if (field && value && value.trim() !== "") {
                    field.value = value;
                    if(fieldId === "keyOptions") {
                        field.dispatchEvent(new Event('change'));
                    }
                }
            }

            window.onload = async function() {
                let prefilledData = ${JSON.stringify(prefilledData)};
                if(prefilledData){ // If prefilled data is undefined, go with defaults only
                    setInitialValue('keyOptions', prefilledData.keyOptions);
                    setInitialValue('keyFieldName', prefilledData.keyFieldName);
                    setInitialValue('customExpression', prefilledData.customExpression);
                    setInitialValue('skipFirstDocuments', prefilledData.skipDocsOrRows);
                    setInitialValue('importUptoDocuments', prefilledData.limitDocsOrRows);
                    setInitialValue('ignoreFields', prefilledData.ignoreFields);
                    setInitialValue('threads', prefilledData.threads);
                    
                    // Verbose Log 
                    if(prefilledData.verboseLog){
                        document.getElementById('verboseLog').checked = true;
                    }
                }

                // After setting prefilled data, set it to undefined so that it doesn't interfere
                ${(prefilledData = undefined)}
            }

            function fetchKeyPreview() {
                
                var keyOptions = document.getElementById('keyOptions').value;
                var keyFieldName = document.getElementById('keyFieldName').value;
                var customExpression = document.getElementById('customExpression').value;

                
                vscode.postMessage({
                    command: "vscode-couchbase.tools.dataImport.fetchKeyPreview",
                    keyType: keyOptions,
                    keyExpr: keyOptions === "fieldValue" ? keyFieldName : (keyOptions === "customExpression" ? customExpression : undefined)
                })
            }

            function onNextClick(event) {
                event.preventDefault(); // prevent form submission

                // Get values from the form
                var keyOptions = document.getElementById('keyOptions').value;
                var keyFieldName = document.getElementById('keyFieldName').value;
                var customExpression = document.getElementById('customExpression').value;
                var skipFirstDocuments = document.getElementById('skipFirstDocuments').value;
                var limitDocsOrRows = document.getElementById('importUptoDocuments').value;
                var ignoreFields = document.getElementById('ignoreFields').value;
                var threads = document.getElementById('threads').value;
                var verboseLog = document.getElementById('verboseLog').checked;
                let generateKeyExpression = "#UUID#"; // Default for setting key expression based on UUID
                if(keyOptions === "fieldValue"){
                    generateKeyExpression = "%" + keyFieldName + "%";
                } else if (keyOptions === "customExpression"){
                    generateKeyExpression = customExpression;
                }
                
                // Consolidate data
                var formData = {
                    keyOptions: keyOptions,
                    keyFieldName: keyFieldName,
                    customExpression: customExpression,
                    skipDocsOrRows: skipFirstDocuments,
                    limitDocsOrRows: limitDocsOrRows,
                    ignoreFields: ignoreFields,
                    threads: threads,
                    verboseLog: verboseLog,
                    generateKeyExpression: generateKeyExpression
                };

                vscode.postMessage({
                    command: 'vscode-couchbase.tools.dataImport.nextGetKeysAndAdvancedSettingsPage',
                    data: formData,
                    datasetAndCollectionData: ${JSON.stringify(
                        datasetAndCollectionData
                    )}
                });
            }

            function onBackClick(event) {
                event.preventDefault(); // prevent form submission
                let lastPageData = ${JSON.stringify(datasetAndCollectionData)};
                var keyOptions = document.getElementById('keyOptions').value;
                var keyFieldName = document.getElementById('keyFieldName').value;
                var customExpression = document.getElementById('customExpression').value;
                var skipFirstDocuments = document.getElementById('skipFirstDocuments').value;
                var limitDocsOrRows = document.getElementById('importUptoDocuments').value;
                var ignoreFields = document.getElementById('ignoreFields').value;
                var threads = document.getElementById('threads').value;
                var verboseLog = document.getElementById('verboseLog').checked;

                // Consolidate data
                var formData = {
                    keyOptions: keyOptions,
                    keyFieldName: keyFieldName,
                    customExpression: customExpression,
                    skipDocsOrRows: skipFirstDocuments,
                    limitDocsOrRows: limitDocsOrRows,
                    ignoreFields: ignoreFields,
                    threads: threads,
                    verboseLog: verboseLog
                };

                 vscode.postMessage({
                    command: 'vscode-couchbase.tools.dataImport.getKeysBack',
                    keysAndAdvancedSettingsData: formData,
                    datasetAndTargetData: lastPageData
                })
            }

            window.addEventListener('message', event => {
                const message = event.data; // The JSON data our extension sent
                switch (message.command) {
                    case "vscode-couchbase.tools.dataImport.sendKeyPreview":
                        let preview = message.preview;
                        if(preview === ""){
                            preview = "No Preview to Show!";
                        }
                        document.getElementById("keyPreviewTextArea").innerHTML = preview;
                        break;
                    case "vscode-couchbase.tools.dataImport.getKeysAndAdvancedSettingsPageFormValidationError":
                        let error = message.error;
                        document.getElementById("validation-error").innerHTML = error;
                }
            })
        </script>
    </html>
    
    `;
};
