export const huggingFaceMigrateWebView = async (buckets: string[]): Promise<string> => {
    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hugging Face Migrate</title>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" rel="stylesheet">
          <style>
            .heading {
                text-align: center;
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
                color: var(--vscode-sideBar-foreground);
                border-radius: 5px;
            }
            
            /* Style for form labels */
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }

            input[type="checkbox"] {
                transform: scale(1.1); 
            }

            input[type="text"] {
                width: 99%;
                padding-top: 8px;
                padding-bottom: 8px;
                margin-bottom: 15px;
                border: 1px solid var(--vscode-settings-sashBorder);
                border-radius: 3px;
                font-size: 16px;
            }
            
            /* Style for form input fields and selects */
            select {
                width: 100%;
                height: 35px;
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

            .select2-container .select2-selection--single {
                height: 35px;
            }


            .select2-container .select2-selection--multiple {
                height: 35px;
            }


            .select2 {
                width: 100% !important;  
                max-width: 100%; 
                box-sizing: border-box; 
                margin-bottom: 15px;
                color: #444;
            }

            .select2-container--default.select2-container--disabled  {
                background-color: #e9ecef;
                color: #6c757d;
            }

            .select2-results__option {
                color: #444;
            }

            .connect-container {
                display: flex; 
                align-items: start;
                gap: 10px;
            }
            
            .connect-destination {
                padding: 10px;
                background-color: #007bff;
                color: #fff;
                cursor: pointer;
                border-radius: 5px;
                display: block;
                margin-top: 10px; 
                white-space: nowrap;
            }
            
            .connect-destination:hover {
                background-color: #0056b3;
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

            .checkbox-container {
                display: flex;
                align-items: center; 
            }

            .checkbox-container label {
                margin-left: 8px;
                position: relative;
                bottom: -2px; 
            }

            .radio-group {
                display: flex;
                align-items: center;
                margin-right: 20px; 
            }
        
            input[type="radio"] {
                margin-top: 0; 
            }
        
            .form-label-align {
                margin-left: 4px; 
                position: relative;
                bottom: -2px; 
            } 
            
            .select2-container--default .select2-selection--single .select2-selection__rendered {
                line-height: 33px;
            }

            .select2-container--default.select2-container--disabled .select2-selection--single,
            .select2-container--default.select2-container--disabled .select2-selection--multiple {
                background-color: #ccc; 
            }

            /* Responsive design */
            @media (max-width: 600px) {
                form {
                    padding: 20px;
                }
            }

            /* Improved button styles */
            input[type="submit"] {
                transition: background-color 0.3s ease;
            }

            input[type="submit"]:hover {
                background-color: #d11a1f;
            }

            /* Flexbox layout for form elements */
            .form-row {
                display: flex;
                flex-direction: column;
                margin-bottom: 15px;
            }

            /* Feedback message styles */
            .validation-error {
                color: #ff0000;
                font-size: 14px;
                padding: 5px;
            }

            .spinner {
                border: 4px solid rgba(0, 0, 0, 0.1);
                border-top: 4px solid #007bff;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }

            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
          </style>
    </head>

    <body>
        <h2 class="heading">HuggingFace to Couchbase Data Migration</h2>
        <form action="#" method="post" id="dataMigrateForm">
            <p>This tool utilizes the HuggingFace Datasets library in the background to migrate the data.</p>
            <p>Please refer to <a href="https://huggingface.co/docs/datasets/index" target="_blank">this </a> for more
                information on how to use the library.</p>

            <div class="separator-container">
                <span class="separator-text">Source</span>
                <div class="separator"></div>
            </div>
            <br>
            <div style="display: flex; align-items: center;">
                <div class="radio-group">
                    <input type="radio" id="useRepo" name="dataMethod" value="repo" checked>
                    <label for="useRepo" class="form-label-align">Repo</label>
                </div>
                <div class="radio-group">
                    <input type="radio" id="usePath" name="dataMethod" value="path">
                    <label for="usePath" class="form-label-align">Path</label>
                </div>
            </div>
            <br>
            <label for="repoLink">Repo Link:</label>
            <input type="text" id="repoLink" name="repoLink" placeholder="e.g., username/dataset_name">
            <div id="trust-code-container" class="checkbox-row">
                <div class="checkbox-container tooltip">
                    <input type="checkbox" id="trust-remote-code" name="trust-remote-code">
                    <label for="trust-remote-code">Trust Remote Code</label>
                    <span class="tooltiptext">Check to enable Trust remote code flag.</span>
                </div>
            </div>
            <div class="form-row" id="repoInputContainer" style="display:none;">
            <br>
            <input type="submit" value="Load Configs" onclick="onLoadConfigsClick(event)" class="redButton">
        </div>
        <div id="loader" style="display: none; text-align: center; margin: 20px 0;">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
        <div id="pathInputContainer" style="display:none;">
            <label for="filePaths">File Paths (comma-separated):</label>
            <input type="text" id="filePaths" name="filePaths" placeholder="e.g., /path/to/file1,/path/to/file2">
        </div>
        <br>
            <div class="validation-error" id="validation-error-connect"></div>
            <div id="configContainer" style="display:none;">
                <div class="separator-container">
                    <span class="separator-text">Configuration</span>
                    <div class="separator"></div>
                </div>
                <label for="configs" class="tooltip">Config:
                    <span class="tooltiptext">Select a configuration for the dataset.</span>
                </label>
                <select name="configs" id="configs" class="js-select2" disabled width="100%"></select>
                <br>
                <label for="splits" class="tooltip">Split:
                    <span class="tooltiptext">Select a data split (e.g., train, test, validation).</span>
                </label>
                <span id="splitLoader" style="display: none; font-size: 12px; color: grey; margin-left: 2px;">Loading...</span>
                <select name="splits" id="splits" class="js-select2" disabled width="100%"></select>
                <label for="fields" class="tooltip">Document ID (optional):
                    <span class="tooltiptext">Comma-separated list of field names to use as document ID</span>
                </label>
                <p>If the user does not provide a document ID, A UUID will be automatically generated and used as the ID. </p>
                <span id="fieldLoader" style="display: none; font-size: 12px; color: grey; margin-left: 2px;">Loading...</span>
                <select name="fields" id="fields" class="js-select2" multiple="multiple" disabled width="100%"></select>
            </div>
            <div class="separator-container">
                <span class="separator-text">Target</span>
                <div class="separator"></div>
            </div>
            <label for="bucket" class="tooltip">Bucket:
                <span class="tooltiptext">Choose the target bucket for migration.</span>
            </label>
            <select name="bucket" id="bucket" onchange="onBucketClick(value)" class="js-select2">
                <option value="" disabled selected>Select a bucket</option>
                ${buckets
                    .map((bucketName) => {
                        return `
                <option value="${bucketName}">${bucketName}</option>
                `;
                    })
                    .join("")}
            </select>
            <br>
            <label for="cbScope" class="tooltip">Scope:
                    <span class="tooltiptext">Choose a target scope for the migration process.</span>
            </label>
            <select name="cbScope" id="cbScope" class="js-select2" disabled width="100%"></select>
            
            <br>
            <label for="cbCollection" class="tooltip">Collection:
                    <span class="tooltiptext">Specify the collection name for the data.</span>
            </label>
            <select name="cbCollection" id="cbCollection" class="js-select2" disabled width="100%"></select>
            <br>
            <div class="validation-error" id="validation-error"></div>
            <input type="submit" value="Migrate" onclick="submitForm(event)" class="redButton">
        </form>
    </body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
    <script>
    const vscode = acquireVsCodeApi();

    $(document).ready(function () {
        // Initialize Select2 on all dropdowns
        $('.js-select2').select2({ width: '100%' });
        // Show repo input container by default since repo radio is checked by default
        $('#repoInputContainer').show();
        $('#pathInputContainer').hide();

        $('#trust-code-container').insertBefore('#repoInputContainer');
        // Event listener for dataMethod radio buttons
        $('input[name="dataMethod"]').change(function () {
            if ($('#useRepo').is(':checked')) {
                $('#repoInputContainer').show(); // Show repo input
                $('#pathInputContainer').hide(); // Hide path input
                $('#repoLink').val(''); // Clear repo link input
                $('#trust-code-container').insertBefore('#repoInputContainer');
            } else if ($('#usePath').is(':checked')) {
                $('#repoInputContainer').hide(); // Hide repo input
                $('#pathInputContainer').show(); // Show path input
                $('#filePaths').val(''); // Clear file paths input
                $('#trust-code-container').insertAfter('#pathInputContainer');

            }
            // Hide config and splits until the configs are loaded
            $('#configContainer').hide();
            $('#configs').val(null).trigger('change');
            $('#splits').val(null).trigger('change');
            $('#configs').prop('disabled', true);
            $('#splits').prop('disabled', true);
        });
    });

    function showLoader() {
        document.getElementById("loader").style.display = "block";
    }

    function hideLoader() {
        document.getElementById("loader").style.display = "none";
    }

    function showSplitLoader() {
        document.getElementById("splitLoader").style.display = "inline";
    }

    function hideSplitLoader() {
        document.getElementById("splitLoader").style.display = "none";
    }

    function showFieldLoader() {
        document.getElementById("fieldLoader").style.display = "inline";
    }

    function hideFieldLoader() {
        document.getElementById("fieldLoader").style.display = "none";
    }

    function onLoadConfigsClick(event) {
        event.preventDefault();
        document.getElementById("validation-error").innerHTML = "";
        document.getElementById("validation-error-connect").innerHTML = "";
        const trustRemoteCodeElement = document.getElementById("trust-remote-code");
        const trustRemoteCode = trustRemoteCodeElement.checked;

        // Ensure the Repo option is selected
        if (!$('#useRepo').is(':checked')) {
            document.getElementById("validation-error-connect").innerHTML = "Please select the 'Repo' option to load configs.";
            return;
        }
        const dataMethod = $('input[name="dataMethod"]:checked').val();
        let repoLink = '';
        let filePaths = '';
        if (dataMethod === 'repo') {
            repoLink = document.getElementById("repoLink").value;
        } else if (dataMethod === 'path') {
            filePaths = document.getElementById("filePaths").value;
        }
        if (!repoLink) {
            document.getElementById("validation-error-connect").innerHTML = "Please enter a repo link.";
            return;
        }

        // Disable configs and splits until data is loaded
        $('#configs').prop('disabled', true);
        $('#splits').prop('disabled', true);

        // Show the loader
        showLoader();

        vscode.postMessage({
            command: "vscode-couchbase.tools.huggingFaceMigrate.listConfigs",
            repositoryPath: repoLink,
            trustRemoteCode: trustRemoteCode,
        });
    }

    function onBucketClick(bucketId) {
        vscode.postMessage({
            command: "vscode-couchbase.tools.huggingFaceMigrate.listScopes",
            bucketId,
        });
    }

    window.addEventListener("message", (event) => {
        const message = event.data; // The JSON data our extension sent

        switch (message.command) {
            case "vscode-couchbase.tools.huggingFaceMigrate.configsInfo":
                hideLoader(); // Hide the loader
                let configs = JSON.parse(message.configs);
                const configsDropdown = document.getElementById("configs");

                // Clear existing options in the configs dropdown
                configsDropdown.innerHTML = "";

                // Add placeholder option
                const placeholderOption = document.createElement("option");
                placeholderOption.value = "";
                placeholderOption.text = "Select a config";
                placeholderOption.disabled = true;
                placeholderOption.selected = true;
                configsDropdown.appendChild(placeholderOption);

                // Validate configs
                if (!configs || !Array.isArray(configs)) {
                    console.error("Invalid configs received:", configs);
                    return; // Exit the function if configs is not valid
                }

                // Add config options
                configs.forEach((config) => {
                    const option = document.createElement("option");
                    option.value = config;
                    option.text = config;
                    configsDropdown.appendChild(option);
                });

                configsDropdown.removeAttribute("disabled");
                $('#configContainer').show();

                $('#configs').on('change', onConfigChange);

                break;

            case "vscode-couchbase.tools.huggingFaceMigrate.splitsInfo":
                hideSplitLoader(); // Hide the loader
                const splitsData = JSON.parse(message.splits);
                const splitsDropdown = document.getElementById("splits");

                // Clear existing options in the splits dropdown
                splitsDropdown.innerHTML = "";

                // Validate splits
                if (!splitsData || !Array.isArray(splitsData)) {
                    console.error("Invalid splits received:", splitsData);
                    return; // Exit the function if configs is not valid
                }

                // Add placeholder option
                const splitPlaceholder = document.createElement("option");
                splitPlaceholder.value = "";
                splitPlaceholder.text = "Select a split";
                splitPlaceholder.disabled = true;
                splitPlaceholder.selected = true;
                splitsDropdown.appendChild(splitPlaceholder);

                // Add split options
                splitsData.forEach((split) => {
                    const option = document.createElement("option");
                    option.value = split;
                    option.text = split;
                    splitsDropdown.appendChild(option);
                });

                splitsDropdown.removeAttribute("disabled");
                $('#splits').on('change', onSplitChange);
                break;
            case "vscode-couchbase.tools.huggingFaceMigrate.scopesInfo":
                const scopes = message.scopes;
                const scopesDropdown = document.getElementById("cbScope");

                // Clear existing options in the scopes dropdown
                scopesDropdown.innerHTML = "";

                // Validate scopes
                if (!scopes || !Array.isArray(scopes)) {
                    console.error("Invalid scopes received:", scopes);
                    return; // Exit the function if scopes is not valid
                }

                // Add placeholder option
                const scopePlaceholder = document.createElement("option");
                scopePlaceholder.value = "";
                scopePlaceholder.text = "Select a scope";
                scopePlaceholder.disabled = true;
                scopePlaceholder.selected = true;
                scopesDropdown.appendChild(scopePlaceholder);

                // Add scope options
                scopes.forEach((scope) => {
                    const option = document.createElement("option");
                    option.value = scope.name;
                    option.text = scope.name;
                    scopesDropdown.appendChild(option);
                });

                scopesDropdown.removeAttribute("disabled");

                $('#cbScope').on('change', function () {
                    onScopeChange(scopes);
                });
                break;
            case "vscode-couchbase.tools.huggingFaceMigrate.fieldsInfo":
                hideFieldLoader(); // Hide the loader
                const fieldsData = JSON.parse(message.fields);
                const fieldsDropdown = document.getElementById("fields");

                // Clear existing options in the fields dropdown
                fieldsDropdown.innerHTML = "";

                // Validate fields
                if (!fieldsData || !Array.isArray(fieldsData)) {
                    console.error("Invalid fields received:", fieldsData);
                    return; // Exit the function if fields are not valid
                }

                // Add placeholder option
                const fieldsPlaceholder = document.createElement("option");
                fieldsPlaceholder.value = "";
                fieldsPlaceholder.text = "Select one or more fields";
                fieldsPlaceholder.disabled = true;
                fieldsDropdown.appendChild(fieldsPlaceholder);

                // Add field options
                fieldsData.forEach((field) => {
                    const option = document.createElement("option");
                    option.value = field;
                    option.text = field;
                    fieldsDropdown.appendChild(option);
                });

                // Enable the fields dropdown
                fieldsDropdown.removeAttribute("disabled");
                $('#fields').select2({ width: '100%' }); // Reinitialize Select2 for multi-select
            break;
            case "loadConfigsError":
                const error = message.error;
                document.getElementById("validation-error-connect").innerHTML = error;
                break;
            case "formValidationError":
                const formError = message.error;
                document.getElementById("validation-error").innerHTML = formError;
                break;
        }
    });

    function onConfigChange() {
        showSplitLoader(); // Show the loader
        const selectedConfig = document.getElementById("configs").value;

        // Reset the "Id Fields" dropdown
        $('#fields').val(null).trigger('change'); // Clear selected values
        $('#fields').prop('disabled', true); // Disable the dropdown
        $('#fields').html(''); // Clear existing options

        const repoLink = document.getElementById("repoLink").value;
        const trustRemoteCodeElement = document.getElementById("trust-remote-code");
        const trustRemoteCode = trustRemoteCodeElement.checked;

        // Disable splits until data is loaded
        $('#splits').prop('disabled', true);
        $('#splits').val(null).trigger('change');

        vscode.postMessage({
            command: "vscode-couchbase.tools.huggingFaceMigrate.listSplits",
            repositoryPath: repoLink,
            trustRemoteCode: trustRemoteCode,
            config: selectedConfig,
        });
    }

    function onSplitChange() {
        const selectedSplit = document.getElementById("splits").value;
        if (!selectedSplit) {
            return;
        }
        showFieldLoader(); // Show the loader

        // Reset the "Id Fields" dropdown
        $('#fields').val(null).trigger('change'); // Clear selected values
        $('#fields').prop('disabled', true); // Disable the dropdown
        $('#fields').html(''); // Clear existing options

        const repoLink = document.getElementById("repoLink").value;
        const trustRemoteCodeElement = document.getElementById("trust-remote-code")
        const trustRemoteCode = trustRemoteCodeElement.checked;
        const selectedConfig = document.getElementById("configs").value;

        // Send a message to fetch fields for the selected split
        vscode.postMessage({
            command: "vscode-couchbase.tools.huggingFaceMigrate.listFields",
            repositoryPath: repoLink,
            trustRemoteCode: trustRemoteCode,
            config: selectedConfig,
            split: selectedSplit,
        });
    }

    function onScopeChange(scopes) {
        const selectedScope = document.getElementById("cbScope").value;
        const collectionsDropdown = document.getElementById("cbCollection");

        // Clear existing options in the collections dropdown
        collectionsDropdown.innerHTML = "";

        if (!selectedScope) {
            return; // Exit if no scope is selected
        }

        // Find the collections for the selected scope
        const selectedScopeData = scopes.find((scope) => scope.name === selectedScope);
        if (!selectedScopeData || !selectedScopeData.collections) {
            console.error("No collections found for the selected scope:", selectedScope);
            return;
        }

        const collections = selectedScopeData.collections;

        // Add placeholder option
        const collectionsPlaceholder = document.createElement("option");
        collectionsPlaceholder.value = "";
        collectionsPlaceholder.text = "Select a collection";
        collectionsPlaceholder.disabled = true;
        collectionsPlaceholder.selected = true;
        collectionsDropdown.appendChild(collectionsPlaceholder);

        // Add collection options
        collections.forEach((collection) => {
            const option = document.createElement("option");
            option.value = collection.name;
            option.text = collection.name;
            collectionsDropdown.appendChild(option);
        });

        // Enable the collections dropdown
        collectionsDropdown.removeAttribute("disabled");
    }

    function submitForm(event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way
        document.getElementById("validation-error").innerHTML = "";

        const repoLink = document.getElementById("repoLink").value;
        const trustRemoteCodeCheckBox = document.getElementById("trust-remote-code");
        const trustRemoteCode = trustRemoteCodeCheckBox.checked;
        const bucket = document.getElementById("bucket").value;
        const scope = document.getElementById("cbScope").value;
        const collection = document.getElementById("cbCollection").value;

// Determine the data method (repo or path)
const dataMethod = $('input[name="dataMethod"]:checked').val();
    let formData = {
        repoLink,
        trustRemoteCode,
        bucket,
        scope,
        collection,
    };

    if (dataMethod === 'repo') {
        // Handle "Repo" method
        const config = document.getElementById("configs").value?.trim() || '';
        const split = document.getElementById("splits").value?.trim() || '';
        const idField = $('#fields').val()?.join(',') || ''; // Get selected values as a comma-separated string

        // Validate "Repo" specific fields
        if (!config || !split) {
            document.getElementById("validation-error").innerHTML = "Please fill in all required fields.";
            return;
        }

        // Add "Repo" specific fields to formData
        formData = {
            ...formData,
            config,
            split,
            idField,
        };
    } else if (dataMethod === 'path') {
        // Handle "Path" method
        const filePaths = document.getElementById("filePaths").value?.trim() || '';

        // Validate "Path" specific fields
        if (!filePaths) {
            document.getElementById("validation-error").innerHTML = "Please fill in all required fields.";
            return;
        }

        // Add "Path" specific fields to formData
        formData = {
            ...formData,
            filePaths,
        };
    };

        vscode.postMessage({
            command: "vscode-couchbase.tools.huggingFaceMigrate.export",
            data: formData,
        });
    }
    </script>
    </html>
    `;
};