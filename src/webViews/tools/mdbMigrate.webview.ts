export const MdbMigrateWebview = async (buckets: string[]): Promise<string> => {
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
                width: 100%; 
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
            
          </style>
</head>

<body>
    <h2 class="heading">Mongodb to Couchbase Data Migration</h2>
    <form action="#" method="post" id="dataMigrateForm">
        <p>This tool utilizes the CLI in the background to migrate the data.</p>
        <p>Please refer to <a href="https://github.com/couchbaselabs/cbmigrate" target="_blank">this </a> for more
            information on how to use the CLI.</p>
        <div class="separator-container">
            <span class="separator-text">Source</span>
            <div class="separator"></div>
        </div>
        <label for="mongodbconnectionstring" class="tooltip">MongoDB Connection URI:
            <span class="tooltiptext">Specify the MongoDB Connection URI</span>
        </label>
        <div class="connect-container">
            <input type="text" id="mongoConnectionString" name="mongoConnectionString">
            <div class="connect-destination redButton" id="mongoConnectionStrings" onclick="onConnectionStringClick()">
                Connect</div>
        </div>
        <br>
        <label for="databases" class="tooltip">Database:
            <span class="tooltiptext">Select the database you want to migrate from.</span>
        </label>
        <select name="databases" id="databases" class="js-select2" disabled onchange="onDatabaseClick()"
            width="100%"></select>
        <br>
        <label for="collections" class="tooltip">Collections:
            <span class="tooltiptext">The collections that you would like to include. You can select
                <strong>All</strong> or more than one option.</span>
        </label>
        <select name="collections" id="collections" multiple class="js-select2" disabled width="100%"></select>
        <br>
        <div class="checkbox-container tooltip">
            <input type="checkbox" id="indexes" name="indexes" checked>
            <label for="indexes">Include Indexes</label>
            <span class="tooltiptext">Check to include indexes in the migration. Indexes are included by default.</span>
        </div>
        <div class="separator-container">
            <span class="separator-text">Target</span>
            <div class="separator"></div>
        </div>
        <label for="bucket" class="tooltip">Bucket:
            <span class="tooltiptext">Choose the top level bucket on which migration should happen. Only 1 bucket can be
                migrated at a time</span>
        </label>
        <select name="bucket" id="bucket" onchange="onBucketClick(value)">
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
function onConnectClick(uri) {
    vscode.postMessage({
        command: "vscode-couchbase.tools.mdbMigrate.connectToMdb",
        connectUri: uri,
    });
}
function onConnectionStringClick() {
    connectionString = document.getElementById("mongoConnectionString").value;
    document.getElementById("validation-error").innerHTML = "";
    document.getElementById("databases").setAttribute("disabled", "");
    document.getElementById("collections").setAttribute("disabled", "");
    vscode.postMessage({
        command: "vscode-couchbase.tools.mdbMigrate.getDatabases",
        connectionString: connectionString,
    });
}

function getFolder() {
    vscode.postMessage({
        command: "vscode-couchbase.tools.mdbMigrate.getFolder",
    });
}

function onBucketClick(bucketId) {
    document.getElementById("cbScopes").setAttribute("disabled", "");

    vscode.postMessage({
        command: "vscode-couchbase.tools.mdbMigrate.getCbScopes",
        bucketId: bucketId,
    });
}

function onDatabaseClick() {
    const connectionString = document.getElementById(
        "mongoConnectionString"
    ).value;
    const selectedDatabase = document.getElementById("databases").value;

    // Disable the collections dropdown until the data is fetched
    document.getElementById("collections").setAttribute("disabled", "");

    // Post a message with the selected database
    vscode.postMessage({
        command: "vscode-couchbase.tools.mdbMigrate.getCollections",
        connectionString: connectionString,
        databases: selectedDatabase,
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

// Function to get selected collections or all if "All" is selected
function getSelectedCollections() {
    const collectionsDropdown = document.getElementById("collections");
    const selectedOptions = Array.from(collectionsDropdown.selectedOptions);
    const isSelectAllSelected = selectedOptions.some(
        (option) => option.value === "all"
    );

    if (isSelectAllSelected) {
        return Array.from(collectionsDropdown.options)
            .map((option) => option.value)
            .filter((value) => value !== "all");
    } else {
        return selectedOptions.map((option) => option.value);
    }
}

window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
        case "vscode-couchbase.tools.mdbMigrate.databaseInfo":
            const databasesData = message.databases;
            const databasesDropdown = document.getElementById("databases");

            // Clear existing options in the scope dropdown
            databasesDropdown.innerHTML = "";

            // Add a placeholder option
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.text = "Select a database";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            databasesDropdown.appendChild(defaultOption);

            // Add database options
            databasesData.forEach((database) => {
                const option = document.createElement("option");
                option.value = database;
                option.text = database;
                databasesDropdown.appendChild(option);
            });
            databasesDropdown.removeAttribute("disabled");
            break;
        case "vscode-couchbase.tools.mdbMigrate.scopesInfo":
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
        case "vscode-couchbase.tools.mdbMigrate.collectionInfo":
            const collectionsData = message.collection;
            const collectionDropdown = document.getElementById("collections");

            // Clear existing options in the scope dropdown
            collectionDropdown.innerHTML = "";
            const selectAllOptionCollection = document.createElement("option");
            selectAllOptionCollection.value = "all";
            selectAllOptionCollection.text = "Select All";
            collectionDropdown.appendChild(selectAllOptionCollection);

            // Add scope options
            collectionsData.forEach((collection) => {
                const option = document.createElement("option");
                option.value = collection;
                option.text = collection;
                collectionDropdown.appendChild(option);
            });
            collectionDropdown.removeAttribute("disabled");
            break;
        case "vscode-couchbase.tools.mdbMigrate.formValidationError":
            const error = message.error;
            document.getElementById("validation-error").innerHTML =
                message.error;
            break;
    }
});


function submitForm(event) {
    event.preventDefault(); // Prevent the form from submitting in the traditional way
    document.getElementById("validation-error").innerHTML = "";
    // Gather data from form fields
    const connectionString = "'" + document.getElementById("mongoConnectionString").value + "'";
    const database = document.getElementById("databases").value;
    const collections = getSelectedCollections();
    const indexesCheckbox = document.getElementById("indexes");
    const indexes = indexesCheckbox.checked;
    const bucket = document.getElementById("bucket").value;
    const cbScope = Array.from(
        document.getElementById("cbScopes").selectedOptions
    )
        .map((option) => option.value)
        .filter((value) => value !== "");
    // Consolidate the data into an object
    const formData = {
        connectionString,
        database,
        collections,
        indexes,
        bucket,
        cbScope,
    };
    vscode.postMessage({
        command: "vscode-couchbase.tools.mdbMigrate.Migrate",
        data: formData,
    });
} 
      </script>
      </html>
      `;
};

