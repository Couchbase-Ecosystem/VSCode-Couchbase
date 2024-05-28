import {
    getUsersNamedParameters,
    getProjectsNamedParameters,
} from "../util/namedParameters";

export const showNamedParameters = (): string => {
    let namedParams = getUsersNamedParameters();
    let projectNamedParams = getProjectsNamedParameters();
    return /*HTML*/ `
    <!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Named Parameters</title>
          
          <style>
            body {
                padding: 0px;
            }
            .named-parameters-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
            }

            .named-parameters-table {
                min-height: 200px;
                display: flex;
                justify-content: space-between;
                width: 100%;
                border: 1px solid var(--vscode-settings-sashBorder);
            }

            .named-parameters-keys {
                display: block;
                position: relative;
                white-space: nowrap;
                width: 30%;
                border-right: 1px solid var(--vscode-settings-sashBorder);
                background-color: var(--vscode-sideBar-background);
                color: var(--vscode-sideBar-foreground);
            }

            .named-parameters-keys-header {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                padding: 5px;
                border-bottom: 1px solid var(--vscode-settings-sashBorder);
                text-align: center;
                padding-left: 10px;
                padding-right: 10px;
            }

            .named-parameters-key-container {
                max-height: 65vh;
                overflow-y: overlay;
                padding-top: 1px;
            }

            .named-parameters-key {
                cursor: pointer;
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-left: 1px;
                margin-right: 1px;
                margin-bottom: 1px;
                padding: 5px;
            }

            .named-parameters-key:hover {
                color: var(--vscode-list-activeSelectionForeground) !important;
                background-color: var(--vscode-list-activeSelectionBackground) !important;
            }

            .named-parameters-key.selected {
                color: var(--vscode-list-activeSelectionForeground);
                background-color: var(--vscode-list-activeSelectionBackground);
                outline: 1px solid
                    var(
                    --vscode-list-focusAndSelectionOutline,
                    var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline))
                    );
            }

            .named-parameters-value {
                width: 70%;
                padding: 10px;
                overflow: scroll;
                font-family: "SF Mono", Monaco, Menlo, Courier, monospace;
                color: var(--vscode-editor-foreground);
                background-color: var(--vscode-editor-background);
                resize: none;
            }

            .named-parameter-note {
                display: inline-block;
                width: 100%;
                margin-top: 20px;
            }

            .tabs {
                display: flex;
                flex-direction: row;
                background-color: var(--vscode-sideBar-background);
                border-top: 1px solid var(--vscode-settings-sashBorder);
                border-bottom: 1px solid var(--vscode-settings-sashBorder);
            }

            /* Style the buttons inside the tab */
            .tab {
                background-color: var(--vscode-tab-inactiveBackground);
                color: var(--vscode-tab-inactiveForeground);
                border: 1px solid var(--vscode-tab-border);
                float: left;
                border: none;
                outline: none;
                cursor: pointer;
                padding: 7px 8px;
                transition: 0.2s;
                font-size: 15px;
            }

            /* Change background color of buttons on hover */
            .tab:hover {
                background-color: var(--vscode-tab-hoverBackground);
                color: var(--vscode-tab-inactiveForeground);
            }

            /* Create an active/current tablink class */
            .tab.active {
                background-color: var(--vscode-tab-activeBackground);
                color: var(--vscode-tab-activeForeground);
            }

            #userSettingsLink {
                text-decoration: underline;
                cursor: pointer;
                color: var(--vscode-textLink-foreground);
            }
          </style>

       </head>
        <body>
            <div class="tabs">
                <div class="tab active" onclick="changeTab(event, 'my')">User's Named Parameters</div>
                <div class="tab" onclick="changeTab(event, 'project')">Project's Named Parameters</div>
            </div>
            <div id="my" class="tabcontent">
                <div class="named-parameters-container">
                    <div class="named-parameters-table">
                        <div class="named-parameters-keys">
                            <div class="named-parameters-keys-header">Keys</div>
                            <div class="named-parameters-key-container">
                                ${
                                    namedParams !== undefined &&
                                    namedParams
                                        .map((kv, index) => {
                                            return `<div class="named-parameters-key user-named-parameters-key" onClick="openMyNamedParams('${index}')">${kv.key}</div>`;
                                        })
                                        .join("")
                                }
                            </div>
                        </div>
                        
                        <textarea class="named-parameters-value user-named-parameters-value" disabled>No Key Selected</textarea>
                    </div>
                    <div class="named-parameter-note" style="display: inline-block;">
                        Note: User's parameters are present in <a onClick="openSettings()" id="userSettingsLink">VSCode User Settings</a>. You can edit from the settings file.
                    </div>
                </div>
                
            </div>
            <div id="project" class="tabcontent" style="display: none;">
                <div class="named-parameters-container">
                    <div class="named-parameters-table">
                        <div class="named-parameters-keys">
                            <div class="named-parameters-keys-header">Keys</div>
                            <div class="named-parameters-key-container">
                                ${
                                    projectNamedParams !== undefined &&
                                    projectNamedParams
                                        .map((kv, index) => {
                                            return `<div class="named-parameters-key project-named-parameters-key" onClick="openProjectNamedParams('${index}')">${kv.key}</div>`;
                                        })
                                        .join("")
                                }
                            </div>
                        </div>
                        
                        <textarea class="named-parameters-value project-named-parameters-value" disabled>No Key Selected</textarea>
                    </div>
                    <div class="named-parameter-note" style="display: inline-block;">
                        Note: Project's parameters are loaded directly from the <strong>.cbNamedParams.properties</strong> file in the project root directory. You can edit from that file.
                    </div>
                </div>
            </div>
            
        </body>
        <script>
            const vscode = acquireVsCodeApi();
            function openMyNamedParams(index) {
                let namedParams = ${JSON.stringify(namedParams)};
                let queryKey = namedParams[index].key;
                let queryValue = namedParams[index].value;
                document.querySelector(".user-named-parameters-value").innerHTML = queryValue;
                document.querySelector(".user-named-parameters-value").id = queryKey;
            }

            function openProjectNamedParams(index) {
                let namedParams = ${JSON.stringify(projectNamedParams)};
                let queryKey = namedParams[index].key;
                let queryValue = namedParams[index].value;
                document.querySelector(".project-named-parameters-value").innerHTML = queryValue;
                document.querySelector(".project-named-parameters-value").id = queryKey;
            }

            // initialize selection event listeners for keys
            const userKeys = document.querySelectorAll('.user-named-parameters-key');
            userKeys.forEach((key) => {
                key.addEventListener('click', () => {
                    userKeys.forEach((k) => {
                        k.classList.remove('selected');
                    });
                    key.classList.add('selected');
                });
            });

            const projectKeys = document.querySelectorAll('.project-named-parameters-key');
            projectKeys.forEach((key) => {
                key.addEventListener('click', () => {
                    projectKeys.forEach((k) => {
                        k.classList.remove('selected');
                    });
                    key.classList.add('selected');
                });
            });

            function changeTab(evt, tabName) {
                let i, tabcontent, tab;
                tabcontent = document.getElementsByClassName("tabcontent");
                for (i = 0; i < tabcontent.length; i++) {
                    tabcontent[i].style.display = "none";
                }
                tab = document.getElementsByClassName("tab");
                for (i = 0; i < tab.length; i++) {
                    tab[i].className = tab[i].className.replace(" active", "");
                }
                document.getElementById(tabName).style.display = "block";
                evt.currentTarget.className += " active";
            }

            function openSettings() {
                vscode.postMessage({
                    command: "openSettings"
                });
            }

        </script>
    </html>
    `;
};
