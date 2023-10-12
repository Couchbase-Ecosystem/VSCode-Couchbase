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
import CollectionNode from "../../model/CollectionNode";
import { IConnection } from "../../types/IConnection";
import { Memory } from "../../util/util";
import { logger } from "../../logger/logger";
import { DocumentNotFoundError } from "couchbase";
import { MemFS } from "../../util/fileSystemProvider";
import { Constants } from "../../util/constants";

interface JsonTemplate {
    [x: string]: any;
}

// Create a JSON Template out from tree data
function createJsonTemplate(treeNode: any, documentId: string | number): JsonTemplate {
    const jsonTemplate: JsonTemplate = {};

    if (!treeNode) {
        return [];
    }

    Object.entries(treeNode).map(property => {
        let propertyValue: any = property[1];
        let type = propertyValue.type;

        if (Array.isArray(type)) {
            type = type.filter(t => t !== null && t !== "null")[0] || null;
        }
        if (property[0] === "id") {
            jsonTemplate[property[0]] = documentId;
        }
        else if (type === 'object') {
            jsonTemplate[property[0]] = createJsonTemplate(propertyValue.properties, documentId);
        } else if (type === 'array') {
            const arrayItemType = type.match(/of (\w+)/);
            if (arrayItemType) {
                const itemType = arrayItemType[1];
                jsonTemplate[property[0]] = [createDefaultItem(itemType)];
            } else {
                jsonTemplate[property[0]] = [];
            }
        } else {
            jsonTemplate[property[0]] = createDefaultItem(type);
        }
    });
    return jsonTemplate;
};

function createDefaultItem(typeName: string) {
    // Create an empty item based on the type
    switch (typeName) {
        case 'string':
            return '';
        case 'number':
            return 0;
        case 'boolean':
            return false;
        case 'null':
            return null;
        case 'array':
            return [];
        case 'object':
            return {};
        default:
            return null;
    }
};

export const createDocument = async (node: CollectionNode, memFs: MemFS, uriToCasMap: Map<string, string>) => {
    const connection = Memory.state.get<IConnection>(Constants.ACTIVE_CONNECTION);
    if (!connection) {
        return;
    }

    const documentId = await vscode.window.showInputBox({
        prompt: "Document Id",
        placeHolder: "Document Id",
        ignoreFocusOut: true,
        value: "",
    });
    if (!documentId) {
        vscode.window.showErrorMessage("Document Id is required.");
        return;
    }
    let documentContent = Buffer.from("{}");
    let patternCnt = 0;
    try {
        let query = "INFER `" + node.bucketName + "`.`" + node.scopeName + "`.`" + node.collectionName + "` WITH {\"sample_size\": 2000}";
        const result = await connection?.cluster?.query(query);
        patternCnt = result?.rows[0].length || 0;
        let documentWithSchema = undefined;
        if (patternCnt > 0) {
            documentWithSchema = await vscode.window.showQuickPick(
                ['Yes', 'No'],
                {
                    placeHolder: 'Do you want to create a Document with Schema Template?',
                    ignoreFocusOut: true
                }
            );
        }
        if (documentWithSchema === 'Yes') {
            let selectedPatternIndex = 0;
            if (patternCnt > 1) {
                const patternOptions = [];
                for (let i = 0; i < patternCnt; i++) {
                    patternOptions.push(`Pattern#${i + 1}`);
                }

                const selectedPattern = await vscode.window.showQuickPick(patternOptions, {
                    placeHolder: 'Choose a pattern for the document. You can review patterns in Schema Section',
                    ignoreFocusOut: true
                });
                if (selectedPattern) {
                    selectedPatternIndex = patternOptions.indexOf(selectedPattern!);
                }
            }

            let row = result?.rows[0][selectedPatternIndex];
            if (row.properties) {
                let childrenNode = createJsonTemplate(row.properties, documentId);
                documentContent = Buffer.from(JSON.stringify(childrenNode, null, 2));
            }
        }
    } catch (err) {
        logger.info("Error while loading schema patterns for document creatiion");
        logger.debug(err);
    }


    const uri = vscode.Uri.parse(
        `couchbase:/${node.bucketName}/${node.scopeName}/Collections/${node.collectionName}/${documentId}.json`
    );
    // Try block is trying to retrieve the document with the same key first
    // If returns an error go to catch block create a new empty document
    try {
        const result = await connection.cluster
            ?.bucket(node.bucketName)
            .scope(node.scopeName)
            .collection(node.collectionName)
            .get(documentId);
        if (result) {
            uriToCasMap.set(uri.toString(), result.cas.toString());
        }
        documentContent = Buffer.from(
            JSON.stringify(result?.content, null, 2)
        );
    } catch (err: any) {
        if (!(err instanceof DocumentNotFoundError)) {
            logger.error(err);
        }
    }
    memFs.writeFile(uri, documentContent, {
        create: true,
        overwrite: true,
    });
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document, { preview: false });
    logger.info(`${node.bucketName}: ${node.scopeName}: ${node.collectionName}: Successfully created the document: ${documentId}`);
};
