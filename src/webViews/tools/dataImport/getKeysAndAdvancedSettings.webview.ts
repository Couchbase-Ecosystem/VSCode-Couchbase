export const getKeysAndAdvancedSettings = (lastPageData: any): string => {
    return /*html*/`
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

            .secondaryButton {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
            }
            .secondaryButton:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
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

                <label for="keyOptions">Key Options:</label>
                <select name="keyOptions" id="keyOptions" onchange="onKeyOptionsClick(value)" width="100%">
                    <option value="random" selected>Generate random UUID for each document</option>
                    <option value="fieldValue">Use the value of field as the key</option>
                    <option value="customExpression">Generate key based on custom expression</option>
                </select>
                <br>

                <div id="fieldNameContainer" hidden>
                    <label for="keyFieldName">Field name:</label>
                    <input type="text" name="keyFieldName" id="keyFieldName" value="cbms">
                    <br>
                </div>
                <br>

                <div id="customExpressionContainer" hidden>
                    <label for="customExpression">Custom expression:</label>
                    <input type="text" name="customExpression" id="customExpression" value="%cbms%">
                    <br>
                </div>
                <br>

                <label for="keyPreview">Key Preview:</label>
                <div class="keyPreviewContainer">
                    <div class="getKeyPreviewButton redButton" id="getKeyPreviewButton" onclick="getFolder()">Fetch preview</div>
                    <textarea id="keyPreviewTextArea" readonly> </textarea>
                </div>
                <br>

                <div class="advanced-container">
                    <div class="advanced-header" id="advanced-header">
                    <span class="arrow-icon">▶️</span>
                        Advanced Settings
                    </div>
                    <div class="advanced-settings" id="advanced-settings">
                        
                        <label for="skipFirstDocuments">Skip the first # Documents:</label>
                        <input type="text" name="skipFirstDocuments" id="skipFirstDocuments" value="">
                        <br>

                        <label for="importUptoDocuments">Import up to # Documents:</label>
                        <input type="text" name="importUptoDocuments" id="importUptoDocuments" value="">
                        <br>
                        
                        <label for="ignoreFields">Ignore the fields:</label>
                        <input type="text" name="ignoreFields" id="ignoreFields" value="">
                        <br>

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
                if(value === "random") {
                    // Don't show any field
                } else if (value === "fieldValue"){
                    document.getElementById('fieldNameContainer').removeAttribute('hidden');
                } else if (value === "customExpression") {
                    document.getElementById('customExpressionContainer').removeAttribute('hidden');
                }
            }

            $(document).ready(function () {
                $("#advanced-header").click(function () {
                    $("#advanced-settings").toggleClass("active");
                    const arrowIcon = $(".arrow-icon");
                    arrowIcon.text(arrowIcon.text() === "▶️" ? "▼" : "▶️");
                });
            });

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
                    command: 'vscode-couchbase.tools.dataImport.runImport',
                    data: formData
                });
            }

            function onBackClick(event) {
                event.preventDefault(); // prevent form submission
                let lastPageData = ${JSON.stringify(lastPageData)};
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
        </script>
    </html>
    
    `;
};