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
import { IConnection } from "../../types/IConnection";
import { Memory } from "../../util/util";
import { logger } from "../../logger/logger";
import { BucketNode } from "../../model/BucketNode";
import { Constants } from "../../util/constants";
import { ScopeExistsError } from "couchbase";

export const createScope = async (node: BucketNode) => {
    const connection = Memory.state.get<IConnection>(Constants.ACTIVE_CONNECTION);
    if (!connection) {
        return;
    }

    const scopeName = await vscode.window.showInputBox({
        prompt: "Scope name",
        placeHolder: "scope name",
        ignoreFocusOut: true,
        value: "",
    });
    if (!scopeName) {
        vscode.window.showErrorMessage("Scope name is required.");
        return;
    }
    if (scopeName.startsWith('_' || scopeName.startsWith('%'))) {
        vscode.window.showErrorMessage(`Scope names cannot start with ${scopeName[0]}`);
        return;
    }
    try {
        const collectionManager = await connection.cluster
            ?.bucket(node.bucketName)
            .collections();
        await collectionManager?.createScope(scopeName);
        logger.info(`${node.bucketName}: Successfully created the scope: ${scopeName}`);
    } catch (error) {
        if (error instanceof ScopeExistsError) {
            vscode.window.showWarningMessage(`A scope with the name ${scopeName} already exists`);
            logger.info(`${node.bucketName}: A scope with the name ${scopeName} already exists`);
        }
    }

};
