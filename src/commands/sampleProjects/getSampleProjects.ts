/*
 *     Copyright 2011-2020 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import * as vscode from "vscode";
import { logger } from "../../logger/logger";
import { getSampleProjectsView } from "../../webViews/sampleProjects.webview";
import gitly from "gitly";

export const getSampleProjects = async (context: vscode.ExtensionContext) => {
    try {
        const panel = vscode.window.createWebviewPanel(
            "sampleProjects",
            "Sample Projects",
            vscode.ViewColumn.One,
            {
                enableScripts: true,
            }
        );
        panel.webview.html = getSampleProjectsView();
        panel.webview.onDidReceiveMessage(
            async (message) => {
                if (!message || !message.repo) {
                    return;
                }

                const projectName = await vscode.window.showInputBox({
                    prompt: "Project Name",
                    placeHolder: "Project-Name",
                    ignoreFocusOut: true,
                    value: "",
                });
                if (!projectName) {
                    vscode.window.showErrorMessage("Project name is required.");
                    return;
                }

                const fileUris = await vscode.window.showOpenDialog({
                    openLabel: "Select location",
                    canSelectMany: false,
                    canSelectFiles: false,
                    canSelectFolders: true,
                });
                if (!fileUris || !fileUris[0]) {
                    vscode.window.showErrorMessage("Project location is required.");
                    return;
                }

                const projectUri = vscode.Uri.joinPath(fileUris[0], projectName);
                try {
                    // test if the project location already exists, if so, show error message
                    // fs.stat will throw an error if the file does not exist
                    await vscode.workspace.fs.stat(projectUri);
                    vscode.window.showErrorMessage("Selected project location already has a project with same name, please choose a different location.", { modal: true });
                    return;
                } catch {
                    // do nothing, project location does not exist
                }

                const repoUrl = `couchbase-examples/${message.repo}`;
                await gitly(repoUrl, projectUri.path, { throw: true });

                vscode.window.showInformationMessage(``);
                let answer = await vscode.window.showInformationMessage(
                    `Example project created at: ${projectUri.path}.`,
                    ...["Open", "Add to Workspace"]
                );
                switch (answer) {
                    case "Open":
                        await vscode.commands.executeCommand(
                            "vscode.openFolder",
                            projectUri
                        );
                        break;
                    case "Add to Workspace":
                        vscode.workspace.updateWorkspaceFolders(
                            vscode.workspace.workspaceFolders
                                ? vscode.workspace.workspaceFolders.length
                                : 0,
                            null,
                            { uri: projectUri }
                        );
                        break;
                }
                panel.dispose();
            },
            undefined,
            context.subscriptions
        );
    } catch (err) {
        logger.error("Failed to open sample projects");
        logger.debug(err);
    }
};
