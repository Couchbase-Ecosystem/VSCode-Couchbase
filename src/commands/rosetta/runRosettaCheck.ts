/*
 *     Copyright 2011-2025 Couchbase, Inc.
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
import * as fs from "fs";
import * as vscode from "vscode";
import { logger } from "../../logger/logger";
import { RosettaCheck } from "../../tools/RosettaCheck";
import { isViolationLine, parseViolations, toDiagnosticsByFile } from "../../util/rosetta/rosettaParser";

/**
 * Runs the Rosetta compatibility checker over the current workspace folder and
 * publishes the results to the given diagnostic collection. The Problems panel
 * then provides the list, click-to-line navigation, and on-hover descriptions.
 */
export async function runRosettaCheck(
    context: vscode.ExtensionContext,
    diagnosticCollection: vscode.DiagnosticCollection,
    resource?: vscode.Uri
): Promise<void> {
    const config = vscode.workspace.getConfiguration("couchbase.rosetta");
    const configuredPath = (config.get<string>("executablePath") ?? "").trim();
    // Rules resolution: the user setting wins; otherwise the rule set bundled in
    // the extension (resources/rosetta/rules), passed to the analyzer as a file://
    // base URL. The analyzer REQUIRES a rules URL, so the bundled set must be present.
    let rulesBaseUrl = (config.get<string>("rulesBaseUrl") ?? "").trim();
    if (!rulesBaseUrl) {
        const bundledRules = vscode.Uri.joinPath(context.extensionUri, "resources", "rosetta", "rules");
        if (fs.existsSync(bundledRules.fsPath)) {
            rulesBaseUrl = bundledRules.toString(); // file:///.../resources/rosetta/rules
        }
    }
    const javaPath = (config.get<string>("javaPath") ?? "").trim();

    // Resolve which checker to run:
    //   1. an explicit user-configured path (dev override / custom install), else
    //   2. the rosetta-check jar bundled inside the extension (the shipped default).
    const bundledJar = vscode.Uri.joinPath(
        context.extensionUri, "resources", "rosetta", "rosetta-check.jar"
    ).fsPath;
    let executablePath = configuredPath;
    if (!executablePath && fs.existsSync(bundledJar)) {
        executablePath = bundledJar;
    }

    if (!executablePath) {
        const openSettings = "Open Settings";
        const choice = await vscode.window.showErrorMessage(
            "The Couchbase compatibility checker could not be found. Set 'couchbase.rosetta.executablePath' to a rosetta-check .jar or binary.",
            openSettings
        );
        if (choice === openSettings) {
            vscode.commands.executeCommand("workbench.action.openSettings", "couchbase.rosetta.executablePath");
        }
        return;
    }

    // The analyzer requires a rules URL; the bundled rule set should always be present.
    if (!rulesBaseUrl) {
        vscode.window.showErrorMessage(
            "Couchbase compatibility rules were not found (the bundled rule set is missing). Try reinstalling the extension, or set 'couchbase.rosetta.rulesBaseUrl'."
        );
        logger.error("[rosetta] No rules URL resolved; the analyzer requires one — aborting.");
        return;
    }

    // rosetta-check scans its working directory. Prefer the folder the user
    // right-clicked in the Explorer; otherwise fall back to a workspace folder.
    const folder = getTargetFolder(resource);
    if (!folder) {
        vscode.window.showErrorMessage("Open a folder or workspace to run the Couchbase compatibility check.");
        return;
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Running Couchbase compatibility check…",
            cancellable: true,
        },
        async (progress, token) => {
            logger.info(`--- Couchbase compatibility check: scanning ${folder.fsPath} ---`);
            logger.info("Note: the analyzer scans the whole folder tree (including node_modules/dist if present); large projects can take a while.");
            logger.showOutput();

            const startTime = Date.now();
            let liveCount = 0;

            const result = await RosettaCheck.run(
                executablePath,
                folder.fsPath,
                rulesBaseUrl || undefined,
                token,
                javaPath || undefined,
                (line, channel) => {
                    if (line.trim().length === 0) {
                        return;
                    }
                    logger.info(`[rosetta] ${line}`);
                    if (channel === "stderr" && isViolationLine(line)) {
                        liveCount++;
                        progress.report({
                            message: `${liveCount} issue${liveCount === 1 ? "" : "s"} found so far…`,
                        });
                    }
                }
            );

            const elapsedMs = Date.now() - startTime;
            logger.info(`--- compatibility check finished in ${elapsedMs} ms (exit code ${result.exitCode}) ---`);

            if (token.isCancellationRequested) {
                vscode.window.showInformationMessage("Couchbase compatibility check cancelled.");
                return;
            }

            if (result.crashed) {
                logger.error(`rosetta-check failed: ${result.errorMessage ?? ""}\n${result.stderr}`);
                vscode.window.showErrorMessage(
                    result.errorMessage ??
                        "Couchbase compatibility check failed. See the Couchbase output channel for details."
                );
                logger.showOutput();
                return;
            }

            // Violations are printed to stderr.
            const violations = parseViolations(result.stderr, folder.fsPath);

            diagnosticCollection.clear();
            for (const [file, diagnostics] of toDiagnosticsByFile(violations)) {
                diagnosticCollection.set(vscode.Uri.file(file), diagnostics);
            }

            if (violations.length === 0) {
                logger.info("No Couchbase compatibility issues found.");
                vscode.window.showInformationMessage("No Couchbase compatibility issues found.");
                return;
            }

            const fileCount = new Set(violations.map((v) => v.absolutePath)).size;
            logger.info(
                `Found ${violations.length} compatibility issue(s) across ${fileCount} file(s); see the Problems panel.`
            );

            // Make the result unmistakable: reveal the Problems panel showing the diagnostics.
            await vscode.commands.executeCommand("workbench.actions.view.problems");

            vscode.window.showWarningMessage(
                `Found ${violations.length} Couchbase compatibility issue${violations.length === 1 ? "" : "s"} in ${fileCount} file${fileCount === 1 ? "" : "s"}. See the Problems panel.`
            );
        }
    );
}

/**
 * Determines the folder to scan. Precedence:
 *   1. an explicit folder the user right-clicked in the Explorer,
 *   2. the workspace folder containing the active editor,
 *   3. the first workspace folder.
 */
function getTargetFolder(resource?: vscode.Uri): vscode.Uri | undefined {
    // Explorer right-click passes the clicked resource as a file:// Uri.
    // (Tree-view menus pass a node object instead, which we ignore here.)
    if (resource instanceof vscode.Uri && resource.scheme === "file") {
        return resource;
    }
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        return undefined;
    }
    const activeUri = vscode.window.activeTextEditor?.document.uri;
    if (activeUri) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeUri);
        if (workspaceFolder) {
            return workspaceFolder.uri;
        }
    }
    return folders[0].uri;
}
