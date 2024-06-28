export const dynamoDBMigrateWebView = async (buckets: string[], awsProfiles: Set<string>, awsRegions: Map<string,string>): Promise<string> => {
    return /*html*/`
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Data Migrate</title>
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
                color: var(--vscode-sideBar-foreground)
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
          </style>
</head>

<body>
    <h2 class="heading">DynamoDB to Couchbase Data Migration</h2>
    <form action="#" method="post" id="dataMigrateForm">
        <p>This tool utilizes the CLI in the background to migrate the data.</p>
        <p>Please refer to <a href="https://github.com/couchbaselabs/cbmigrate" target="_blank">this </a> for more
            information on how to use the CLI.</p>
        <div class="separator-container">
            <span class="separator-text">Connect</span>
            <div class="separator"></div>
        </div>
        <label for="awsRegion" class="tooltip">AWS Region:
            <span class="tooltiptext">Select the AWS region where your tables to migrate is located.</span>
        </label>

        <select id="awsRegion" name="awsRegion" class="js-select2">
            <option value="" disabled selected>Select a region</option>
            ${Array.from(awsRegions).map(([name, code]) => {
            return `<option value="${code}">${name}</option>`;
            }).join('')}
        </select>
        <br>
        <div style="display: flex; align-items: center;">
            <div class="radio-group">
                <input type="radio" id="useProfile" name="authMethod" value="profile">
                <label for="useProfile" class="form-label-align">AWS Profile</label>
            </div>
            <div class="radio-group">
                <input type="radio" id="useKeys" name="authMethod" value="keys">
                <label for="useKeys" class="form-label-align">Access Key/Secret Key</label>
            </div>
        </div>

        <br>
        <div class="form-row" id="profileInputContainer">
            <label for="awsProfile">Profile:</label>
            <select id="awsProfile" name="awsProfile" class="js-select2" width="100%">
                <option value="" disabled selected>Select a profile</option>
                ${Array.from(awsProfiles).map(profile => {
                return `
                <option value="${profile}">${profile}</option>
                `;
                })}
            </select>
        </div>
        <div id="keysInputContainer" style="display:none;">
            <label for="awsAccessKeyId">Access Key ID:</label>
            <input type="text" id="awsAccessKeyId" name="awsAccessKeyId">
            <label for="awsSecretAccessKey">Secret Access Key:</label>
            <input type="text" id="awsSecretAccessKey" name="awsSecretAccessKey">
        </div>
        <br>
        <div class="validation-error" id="validation-error-connect"></div>
        <input type="submit" value="Connect" onclick="onConnectClick(event)" class="redButton">
        <div class="separator-container">
            <span class="separator-text">Source</span>
            <div class="separator"></div>
        </div>
        <label for="tables" class="tooltip">Tables:
            <span class="tooltiptext">The tables that you would like to import. You can select
                <strong>All</strong> or more than one option.</span>
        </label>
        <select name="tables" id="tables" multiple class="js-select2" disabled width="100%"></select>
        <br>
        <div class="checkbox-row">
            <div class="checkbox-container tooltip">
                <input type="checkbox" id="indexes" name="indexes" checked>
                <label for="indexes">Include Indexes</label>
                <span class="tooltiptext">Check to include indexes in the migration. Indexes are included by
                    default.</span>
            </div>
            <div class="checkbox-container tooltip">
                <input type="checkbox" id="sslNoVerify" name="sslNoVerify">
                <label for="sslNoVerify">SSL No Verify</label>
                <span class="tooltiptext">Disables SSL</span>
            </div>
            <div class="checkbox-container tooltip">
                <input type="checkbox" id="verbose" name="verbose">
                <label for="verbose">Enable Verbose Mode</label>
                <span class="tooltiptext">Enables verbose mode for detailed logging information during the migration
                    process.</span>
            </div>
        </div>
        <div class="separator-container">
            <span class="separator-text">Target</span>
            <div class="separator"></div>
        </div>
        <label for="bucket" class="tooltip">Bucket:
            <span class="tooltiptext">Choose the top level bucket on which migration should happen. Only 1 bucket can be
                migrated at a time</span>
        </label>
        <select name="bucket" id="bucket" onchange="onBucketClick(value)" class="js-select2">
            <option value="" disabled selected>Select a bucket</option>
            ${buckets.map((bucketName) => {
            return `
            <option value="${bucketName}">${bucketName}</option>
            `;
            })}
        </select>
        <br>
        <label for="cbScopes" class="tooltip">Scope:
            <span class="tooltiptext">Choose a target scope for the migration process.</span>
        </label>
        <select name="cbScopes" id="cbScopes" class="js-select2" disabled width="100%"></select>
        <br>
        <div class="validation-error" id="validation-error"></div>
        <input type="submit" value="Migrate" onclick="submitForm(event)" class="redButton">
    </form>
</body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
<script>
const vscode = acquireVsCodeApi();
let scopesSpecData = [];
window.onload = function () {
    var awsProfilePresent = isAwsProfilePresent();
    document.getElementById('useProfile').checked = awsProfilePresent;
    document.getElementById('useKeys').checked = !awsProfilePresent;

    $('input[name="authMethod"]').change(function () {
        if ($('#useProfile').is(':checked')) {
            $('#profileInputContainer').show();
            $('#keysInputContainer').hide();
        } else {
            $('#profileInputContainer').hide();
            $('#keysInputContainer').show();
        }
    });

    $('.js-select2').select2({ width: '100%' });

    // Initially set visibility based on the current state of the radio buttons
    if (awsProfilePresent) {
        $('#profileInputContainer').show();
        $('#keysInputContainer').hide();
    } else {
        $('#profileInputContainer').hide();
        $('#keysInputContainer').show();
    }
    $('.js-select2').select2({ width: '100%' });
};
function onConnectClick(event) {
    event.preventDefault();
    document.getElementById("validation-error").innerHTML = "";
    document.getElementById("validation-error-connect").innerHTML = "";
    awsRegion = document.getElementById("awsRegion").value;
    awsProfile = document.getElementById("awsProfile").value;
    awsAccessKeyId = document.getElementById("awsAccessKeyId").value
    awsSecretAccessKey = document.getElementById("awsSecretAccessKey").value

    document.getElementById("tables").setAttribute("disabled", "");
    if ($('#useProfile').is(':checked')) {
        vscode.postMessage({
            command: "vscode-couchbase.tools.dynamodbMigrate.getTables",
            awsRegion: awsRegion,
            awsProfile: awsProfile,
            useAwsProfile: true,
        });
    } else {

        vscode.postMessage({
            command: "vscode-couchbase.tools.dynamodbMigrate.getTables",
            awsRegion: awsRegion,
            awsAccessKeyId: awsAccessKeyId,
            awsSecretAccessKey: awsSecretAccessKey,
            useAwsProfile: false,
        });
    }
}
function isAwsProfilePresent() {
    return ${ awsProfiles.size !== 0 };
}
$(document).ready(function () {
    $('input[name="authMethod"]').change(function () {
        if ($('#useProfile').is(':checked')) {
            document.getElementById("tables").setAttribute("disabled", "disabled");
            document.getElementById("tables").innerHTML = '';
            $('#profileInputContainer').show();
            $('#keysInputContainer').hide();
        } else {
            document.getElementById("tables").setAttribute("disabled", "disabled");
            document.getElementById("tables").innerHTML = '';
            $('#profileInputContainer').hide();
            $('#keysInputContainer').show();
        }
    });

    $('.js-select2').select2({ width: '100%' });
});


function onBucketClick(bucketId) {
    document.getElementById("cbScopes").setAttribute("disabled", "");

    vscode.postMessage({
        command: "vscode-couchbase.tools.dynamodbMigrate.getCbScopes",
        bucketId: bucketId,
    });
}


$(document).ready(function () {
    // Initialize Select2 on all dropdowns
    $(".js-select2").select2();

    // Function to handle collection selection changes
    function handleCollectionSelection() {
        // Temporarily unbind the change event to avoid infinite loop
        $("#collections").off("change", handleCollectionSelection);

        const collectionsDropdown = document.getElementById("collections");
        const selectedOptions = Array.from(collectionsDropdown.selectedOptions);
        const isSelectAllSelected = selectedOptions.some(
            (option) => option.value === "all"
        );

        if (isSelectAllSelected) {
            collectionsDropdown.querySelectorAll("option").forEach((option) => {
                if (option.value !== "all") option.selected = false;
            });

            $(collectionsDropdown).trigger("change");
        } else {
            const allOption = collectionsDropdown.querySelector(
                'option[value="all"]'
            );
            if (allOption && allOption.selected) {
                allOption.selected = false;
                $(collectionsDropdown).trigger("change");
            }
        }
        $("#collections").on("change", handleCollectionSelection);
    }

    $("#collections").on("change", handleCollectionSelection);
});

// Function to get selected tables or all if "All" is selected
function getSelectedTables() {
    const tablesDropdown = document.getElementById("tables");
    const selectedOptions = Array.from(tablesDropdown.selectedOptions);
    const isSelectAllSelected = selectedOptions.some(
        (option) => option.value === "all"
    );

    if (isSelectAllSelected) {
        return Array.from(tablesDropdown.options)
            .map((option) => option.value)
            .filter((value) => value !== "all");
    } else {
        return selectedOptions.map((option) => option.value);
    }
}

window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
        case "vscode-couchbase.tools.dynamodbMigrate.tableInfo":
            const tablesData = message.tables;
            const tableDropdown = document.getElementById("tables");

            // Clear existing options in the table dropdown
            tableDropdown.innerHTML = "";
            const selectAllOptiontable = document.createElement("option");
            selectAllOptiontable.value = "all";
            selectAllOptiontable.text = "Select All";
            tableDropdown.appendChild(selectAllOptiontable);

            // Add scope options
            tablesData.forEach((table) => {
                const option = document.createElement("option");
                option.value = table;
                option.text = table;
                tableDropdown.appendChild(option);
            });
            tableDropdown.removeAttribute("disabled");
            break;
        case "vscode-couchbase.tools.dynamodbMigrate.scopesInfo":
            const cbscopesData = message.scopes;
            cbscopesSpecData = cbscopesData;
            const cbscopeDropdown = document.getElementById("cbScopes");

            // Clear existing options in the scope dropdown
            cbscopeDropdown.innerHTML = "";

            // Create and add the placeholder option
            const placeholderOption = document.createElement("option");
            placeholderOption.value = "";
            placeholderOption.text = "Select a scope";
            placeholderOption.disabled = true; // Make it non-selectable
            placeholderOption.selected = true; // Make it the default selected option
            cbscopeDropdown.appendChild(placeholderOption);

            // Add the actual scope options
            cbscopesData.forEach((cbscope) => {
                const option = document.createElement("option");
                option.value = cbscope.name;
                option.text = cbscope.name;
                cbscopeDropdown.appendChild(option);
            });

            // Enable the dropdown
            cbscopeDropdown.removeAttribute("disabled");
            break;
        case "vscode-couchbase.tools.dynamodbMigrate.formValidationError":
            const error = message.error;
            document.getElementById("validation-error").innerHTML =
                message.error;
            break;
        case "vscode-couchbase.tools.dynamodbMigrate.connectValidationError":
            document.getElementById("tables").setAttribute("disabled", "disabled");
            document.getElementById("tables").innerHTML = '';
            const connectError = message.error;
            document.getElementById("validation-error-connect").innerHTML =
                connectError;
            break;
    }
});


function submitForm(event) {
    event.preventDefault(); // Prevent the form from submitting in the traditional way
    document.getElementById("validation-error").innerHTML = "";
    // Gather data from form fields
    const useAwsProfile = $('#useProfile').is(':checked');
    const awsProfile = document.getElementById("awsProfile").value;
    const awsRegion = document.getElementById("awsRegion").value;
    const awsAccessKey = document.getElementById("awsAccessKeyId").value;
    const awsSecretKey = document.getElementById("awsSecretAccessKey").value;
    const tables = getSelectedTables();
    const indexesCheckbox = document.getElementById("indexes");
    const indexes = indexesCheckbox.checked;
    const cbBucket = document.getElementById("bucket").value;
    const cbScope = Array.from(
        document.getElementById("cbScopes").selectedOptions
    )
        .map((option) => option.value)
        .filter((value) => value !== "");
    // Consolidate the data into an object
    const verboseDebugCheckbox = document.getElementById("verbose");
    const debug = verboseDebugCheckbox.checked;
    const sslNoVerifyCheckbox = document.getElementById("sslNoVerify");
    const sslNoVerify = sslNoVerifyCheckbox.checked;
    const formData = {
        useAwsProfile,
        awsProfile,
        awsRegion,
        tables,
        awsAccessKey,
        awsSecretKey,
        cbScope,
        cbBucket,
        indexes,
        debug,
        sslNoVerify,
    };
    vscode.postMessage({
        command: "vscode-couchbase.tools.dynamodbMigrate.Migrate",
        data: formData,
    });
} 
      </script>
      </html>
      `;
};
