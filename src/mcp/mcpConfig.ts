/*
 *     Copyright 2011-2023 Couchbase, Inc.
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

import * as vscode from 'vscode';
import { logger } from '../logger/logger';

export interface CouchbaseMCPConfig {
  readOnlyMode: boolean;
  disabledTools: string[];
  confirmationRequiredTools: string[];
  exportsPath: string;
}

/**
 * Retrieves MCP configuration from VS Code settings
 */
export function getMCPConfigFromVSCodeSettings(): Partial<CouchbaseMCPConfig> {
  const mcpConfiguration = vscode.workspace.getConfiguration('couchbase.mcp');
  const readOnlyMode = mcpConfiguration.get<boolean>('readOnlyMode');

  const config: Partial<CouchbaseMCPConfig> = {
    readOnlyMode: readOnlyMode ?? true,
    disabledTools: mcpConfiguration.get<string[]>('disabledTools', []),
    confirmationRequiredTools: mcpConfiguration.get<string[]>('confirmationRequiredTools', []),
    exportsPath: mcpConfiguration.get<string>('exportsPath', ''),
  };

  logger.debug(`Retrieved MCP config from VS Code settings: ${JSON.stringify(config)}`);

  return config;
}


