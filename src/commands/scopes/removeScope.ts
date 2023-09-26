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
import { ScopeNode } from "../../model/ScopeNode";
import { Constants } from "../../util/constants";

export const removeScope = async (node: ScopeNode) => {
    const connection = Memory.state.get<IConnection>(Constants.ACTIVE_CONNECTION);
    if (!connection) {
        return;
    }

    let answer = await vscode.window.showInformationMessage(
        `Are you sure you want to delete the scope ${node.scopeName}?`,
        ...["Yes", "No"]
    );
    if (answer !== "Yes") {
        return;
    }
    const collectionManager = await connection.cluster
        ?.bucket(node.bucketName)
        .collections();
    await collectionManager?.dropScope(node.scopeName);
    logger.info(`${node.bucketName}: The scope named ${node.scopeName} has been deleted`);
};
