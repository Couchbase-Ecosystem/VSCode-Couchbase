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
import { MemFS } from "../../util/fileSystemProvider";
import IndexNode from "../../model/IndexNode";

export const openIndexInfo = async (indexNode: IndexNode, memFs: MemFS) => {
  try {
    const uri = vscode.Uri.parse(
      `couchbase:/${indexNode.bucketName}/${indexNode.scopeName}/Indexes/${indexNode.indexName}.sqlpp`
    );
    memFs.writeFile(
      uri,
      Buffer.from(indexNode.data),
      { create: true, overwrite: true }
    );
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document, { preview: false });
    return true;
  } catch (err: any) {
    logger.error("Failed to open index information");
    logger.debug(err);
  }
};
