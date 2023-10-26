export const getSummary = async (
    datasetAndCollectionData: any,
    keysAndAdvancedSettingsData: any
) => {

    // Scope And Collection Data Processing for summary
    let scopeAndCollectionValue = "";
    let scopeAndCollectionExpr = datasetAndCollectionData.scopeCollectionExpression;
    const scopeAndCollectionType = datasetAndCollectionData.scopesAndCollections;
    let showExtraScopeAndCollection = false;
    let scopeData = "";
    let collectionData = "";
    
    if(scopeAndCollectionType === "defaultCollection") {
        scopeAndCollectionValue = "Default Scope and Collection";
    } else if(scopeAndCollectionType === "SpecifiedCollection") {
        scopeAndCollectionValue = "Specifed Scope and Collection";
        showExtraScopeAndCollection = true;
        scopeData = datasetAndCollectionData.scopesDropdown;
        collectionData = datasetAndCollectionData.collectionsDropdown;
    } else if(scopeAndCollectionType === "dynamicCollection") {
        scopeAndCollectionValue = "Dynamic Scope and Collection";
        showExtraScopeAndCollection = true;
        scopeData = datasetAndCollectionData.scopesDynamicField;
        collectionData = datasetAndCollectionData.collectionsDynamicField;
    }

    // Document Keys Data Processing for summary
    let documentKeyValue = "";
    let keyField = "";
    let keyExpr = keysAndAdvancedSettingsData.generateKeyExpression;
    let showExtraKeyField = false;
    const documentKeyType = keysAndAdvancedSettingsData.keyOptions;

    if(documentKeyType === "random") {
        documentKeyValue = "Generate Random UUID for each Document";
    } else if(documentKeyType === "fieldValue") {
        documentKeyValue = "Use the value of field as the key";
        showExtraKeyField = true;
        keyField = keysAndAdvancedSettingsData.keyFieldName;
    } else if(documentKeyType === "customExpression") {
        documentKeyValue = "Generate key based on custom expression";
    }

    // Advanced Settings

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

                .main-container {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 30px;
                    border: 1px solid var(--vscode-settings-sashBorder);
                    background-color: var(--vscode-sideBar-background);
                    color: var(--vscode-sideBar-foreground);
                    border-radius: 5px;
                }

                .container {
                    margin: 20px 0px;
                }

                .label {
                    font-size: 16px;
                    font-weight: bold;
                    display: inline;
                }

                .value {
                    font-size: 16px;
                    margin-left: 5px;
                    display: inline;
                    color: #888;
                }

                .secondary-label {
                    font-size: 14px;
                    font-style: italic;
                    display: inline;
                }
                .secondary-value {
                    font-size: 14px;
                    margin-left: 5px;
                    display: inline; /* Display label and value on the same line */
                    color: #888; /* Secondary data color */
                    font-style: italic; /* Italicize the secondary data */
                }

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
            </style>
            <body>
                <h1 class="heading">Import Data</h1>
                <div class="main-container">
                    <div class="container" id="dataset-container">
                        <div id="dataset-label" class="label">Dataset Path: </div>
                        <div id="dataset-value" class="value">${datasetAndCollectionData.dataset}</div>
                    </div>

                    <div class="container" id="bucket-container">
                        <div id="bucket-label" class="label">Bucket Name: </div>
                        <div id="bucket-value" class="value">${datasetAndCollectionData.bucket}</div>
                    </div>

                    <div class="container" id="scopesAndCollections-container">
                        <div id="scopesAndCollections-label" class="label">Scopes and Collections: </div>
                        <div id="scopesAndCollections-value" class="value">${scopeAndCollectionValue}</div>
                        ${showExtraScopeAndCollection === true ?
                            `<br>
                            <div id="scopeData-label" class="secondary-label"> - Scope: </div>
                            <div id="scopeData-value" class="secondary-value">${scopeData}</div>

                            <br>
                            <div id="collectionData-label" class="secondary-label"> - Collection: </div>
                            <div id="collectionData-value" class="secondary-value">${collectionData}</div>
                            ` : ``
                        }
                        <br>
                        <div id="scopeCollectionExpression-label" class="secondary-label"> - Scope and Collection Expression: </div>
                        <div id="scopeCollectionExpression-value" class="secondary-value">${scopeAndCollectionExpr}</div>
                    </div>

                    <div class="container" id="key-container">
                        <div id="documentKey-label" class="label">Document Key: </div>
                        <div id="documentKey-value" class="value">${documentKeyValue}</div>
                        ${
                            showExtraKeyField === true ?
                            `<br>
                                <div id="keyField-label" class="secondary-label"> - Key Field: </div>
                                <div id="keyField-value" class="secondary-value">${keyField}</div>
                            ` : ``
                        }
                        <br>
                        <div id="keyExpression-label" class="secondary-label"> - Key Expression: </div>
                        <div id="keyExpression-value" class="secondary-value">${keyExpr}</div>
                    </div>

                    <div class="container" id="key-container">
                        <div id="AdvancedSettings-label" class="label">Advanced Settings: </div>
                        ${
                            keysAndAdvancedSettingsData.skipDocsOrRows && keysAndAdvancedSettingsData.skipDocsOrRows.trim() !== "" ? 
                            `
                            <br>
                                <div id="skipDocsOrRows-label" class="secondary-label"> - Skip First Documents: </div>
                                <div id="skipDocsOrRows-value" class="secondary-value">${keysAndAdvancedSettingsData.skipDocsOrRows}</div>
                            ` : ``
                        }
                        ${
                            keysAndAdvancedSettingsData.limitDocsOrRows && keysAndAdvancedSettingsData.limitDocsOrRows.trim() !== "" ? 
                            `
                            <br>
                            <div id="limitDocsOrRows-label" class="secondary-label"> - Limit Documents/Rows: </div>
                            <div id="limitDocsOrRows-value" class="secondary-value">${keysAndAdvancedSettingsData.limitDocsOrRows}</div>
                            ` : ``
                        }
                        ${
                            keysAndAdvancedSettingsData.ignoreFields && keysAndAdvancedSettingsData.ignoreFields.trim() !== "" ? 
                            `
                            <br>
                            <div id="ignoreFields-label" class="secondary-label"> - Ignore Fields: </div>
                            <div id="ignoreFields-value" class="secondary-value">${keysAndAdvancedSettingsData.ignoreFields}</div>
                            ` : ``
                        }
                        ${
                            keysAndAdvancedSettingsData.threads && keysAndAdvancedSettingsData.threads.trim() !== "" ? 
                            `
                            <br>
                            <div id="threads-label" class="secondary-label"> - Threads: </div>
                            <div id="threads-value" class="secondary-value">${keysAndAdvancedSettingsData.threads}</div>
                            ` : ``
                        }

                        <br>
                            <div id="verboseLog-label" class="secondary-label"> - Verbose Log: </div>
                            <div id="verboseLog-value" class="secondary-value">${keysAndAdvancedSettingsData.verboseLog}</div>
                    </div>

                    <div class="buttonsContainer">
                        <input type="submit" value="Submit" onclick="onSubmitClick(event)" class="redButton">
                        <input type="submit" value="Back" onclick="onBackClick(event)" class="secondaryButton">
                    </div>
                </div>
            </body>

            <script>
                const vscode = acquireVsCodeApi();
                function onSubmitClick(event) {
                    event.preventDefault();
                    vscode.postMessage({
                        command: "vscode-couchbase.tools.dataImport.runImport",
                        datasetAndCollectionData: ${JSON.stringify(datasetAndCollectionData)},
                        keysAndAdvancedSettingsData: ${JSON.stringify(keysAndAdvancedSettingsData)}
                    })
                }

                function onBackClick(event) {
                    event.preventDefault();
                    vscode.postMessage({
                        command: "vscode-couchbase.tools.dataImport.onBackSummary",
                        datasetAndCollectionData: ${JSON.stringify(datasetAndCollectionData)},
                        keysAndAdvancedSettingsData: ${JSON.stringify(keysAndAdvancedSettingsData)}
                    })
                }
            </script>
        </head>
    </html>
    `;
};
