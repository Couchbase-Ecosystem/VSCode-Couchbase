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
  transport: 'stdio' | 'http' | 'sse';
  httpPort: number;
  exportsPath: string;
  exportTimeoutMs: number;
  exportCleanupIntervalMs: number;
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
    transport: mcpConfiguration.get<'stdio' | 'http' | 'sse'>('transport', 'stdio'),
    httpPort: mcpConfiguration.get<number>('httpPort', 0),
    exportsPath: mcpConfiguration.get<string>('exportsPath', ''),
    exportTimeoutMs: mcpConfiguration.get<number>('exportTimeoutMs', 300000),
    exportCleanupIntervalMs: mcpConfiguration.get<number>('exportCleanupIntervalMs', 120000),
  };

  logger.debug(`Retrieved MCP config from VS Code settings: ${JSON.stringify(config)}`);

  return config;
}

/**
 * Validates the MCP configuration
 */
export function validateMCPConfig(config: Partial<CouchbaseMCPConfig>): boolean {
  if (config.httpPort && (config.httpPort < 0 || config.httpPort > 65535)) {
    logger.error('Invalid HTTP port specified in MCP config');
    return false;
  }

  if (config.exportTimeoutMs !== undefined && config.exportTimeoutMs < 1000) {
    logger.error('Export timeout must be at least 1000ms');
    return false;
  }

  if (config.exportCleanupIntervalMs !== undefined && config.exportCleanupIntervalMs < 1000) {
    logger.error('Export cleanup interval must be at least 1000ms');
    return false;
  }

  return true;
}
