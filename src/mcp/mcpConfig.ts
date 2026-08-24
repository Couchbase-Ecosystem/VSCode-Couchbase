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

import * as path from 'path';
import * as vscode from 'vscode';
import { logger } from '../logger/logger';

/**
 * The Couchbase MCP server is pinned to an exact release rather than resolved
 * to whatever `uvx` finds newest, so an upstream release can never change the
 * tool surface or configuration contract of an already-installed extension.
 * Bump this deliberately, together with `MCP_WRITE_TOOLS` below and the
 * `disabledTools` / `confirmationRequiredTools` tool enums in package.json,
 * when moving to a newer server. The server ignores unknown tool names with a
 * warning, so a stale enum fails silently rather than loudly.
 */
export const MCP_SERVER_PACKAGE = 'couchbase-mcp-server';
export const MCP_SERVER_VERSION = '1.0.1';

/** `uvx` package specifier that pins the exact version, e.g. `couchbase-mcp-server@1.0.1`. */
export const MCP_SERVER_PACKAGE_SPEC = `${MCP_SERVER_PACKAGE}@${MCP_SERVER_VERSION}`;

/**
 * Write tools shipped by MCP_SERVER_VERSION. The server does not load any of
 * these when read-only mode is on, so listing them in `disabledTools` is a
 * no-op and they are filtered out of the environment in that case.
 */
export const MCP_WRITE_TOOLS = [
  'upsert_document_by_id',
  'insert_document_by_id',
  'replace_document_by_id',
  'delete_document_by_id',
  'mutate_subdocument',
  'create_scope',
  'create_collection',
  'delete_scope',
  'delete_collection',
  'create_index',
  'build_index',
  'drop_index',
] as const;

/**
 * Log levels accepted by CB_MCP_LOG_LEVEL.
 *
 * The server also accepts `trace`, but nothing in it logs below DEBUG - that
 * level only lowers the threshold far enough for the Couchbase SDK's own TRACE
 * records to pass through, and it appears in neither the server's documented
 * configuration nor its `--log-level` help. It is deliberately not offered
 * here; `debug` is the most verbose level the server actually emits.
 */
export type MCPLogLevel = 'off' | 'debug' | 'info' | 'warning' | 'error';

/** Log destinations accepted by CB_MCP_LOG_SINKS. */
export type MCPLogSink = 'stderr' | 'file';

/** Levels that get their own rotating file, and so their own size/retention override. */
export type MCPLogFileLevel = 'error' | 'warning' | 'info' | 'debug';

const MCP_LOG_FILE_LEVELS: MCPLogFileLevel[] = ['error', 'warning', 'info', 'debug'];

export interface CouchbaseMCPConfig {
  readOnlyMode: boolean;
  disabledTools: string[];
  confirmationRequiredTools: string[];
  logLevel: MCPLogLevel;
  logSinks: MCPLogSink[];
  logFile: string;
  logRotationMaxSizeMB: number;
  logRotationMaxSizeMBPerLevel: Partial<Record<MCPLogFileLevel, number>>;
  logRetentionBackupCount: number;
  logRetentionBackupCountPerLevel: Partial<Record<MCPLogFileLevel, number>>;
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
    logLevel: mcpConfiguration.get<MCPLogLevel>('logLevel', 'info'),
    logSinks: mcpConfiguration.get<MCPLogSink[]>('logSinks', ['stderr']),
    logFile: mcpConfiguration.get<string>('logFile', ''),
    logRotationMaxSizeMB: mcpConfiguration.get<number>('logRotationMaxSizeMB', 1),
    logRotationMaxSizeMBPerLevel: mcpConfiguration.get<Partial<Record<MCPLogFileLevel, number>>>(
      'logRotationMaxSizeMBPerLevel',
      {}
    ),
    logRetentionBackupCount: mcpConfiguration.get<number>('logRetentionBackupCount', 1),
    logRetentionBackupCountPerLevel: mcpConfiguration.get<
      Partial<Record<MCPLogFileLevel, number>>
    >('logRetentionBackupCountPerLevel', {}),
  };

  logger.debug(`Retrieved MCP config from VS Code settings: ${JSON.stringify(config)}`);

  return config;
}

/** True when the user asked for per-level log files. */
export function isFileLoggingEnabled(config: Partial<CouchbaseMCPConfig>): boolean {
  return (config.logSinks ?? ['stderr']).includes('file');
}

/**
 * Resolves the base path for the per-level log files, or undefined when the
 * file sink is off.
 *
 * The result is always absolute: an empty `couchbase.mcp.logFile` falls back to
 * `defaultLogFilePath`, and a relative one is resolved against that default's
 * directory. Either way the log files never land in whatever working directory
 * the server process happens to inherit.
 */
export function resolveLogFilePath(
  config: Partial<CouchbaseMCPConfig>,
  defaultLogFilePath: string
): string | undefined {
  if (!isFileLoggingEnabled(config)) {
    return undefined;
  }
  const configuredPath = config.logFile?.trim();
  if (!configuredPath) {
    return defaultLogFilePath;
  }
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(path.dirname(defaultLogFilePath), configuredPath);
}

/**
 * Directory the per-level log files are written to, or undefined when the file
 * sink is off.
 */
export function resolveLogDirectory(
  config: Partial<CouchbaseMCPConfig>,
  defaultLogFilePath: string
): string | undefined {
  const logFilePath = resolveLogFilePath(config, defaultLogFilePath);
  return logFilePath ? path.dirname(logFilePath) : undefined;
}

/**
 * Builds the environment for the MCP server process from the VS Code settings.
 *
 * This is the single place the `CB_*` contract of MCP_SERVER_VERSION is
 * expressed, shared by the server definition handed to VS Code and by the
 * example config document, so the two can never drift apart.
 *
 * OAuth and mTLS variables are intentionally not emitted: the extension only
 * ever runs the server over stdio as a child process using the credentials of
 * the active connection.
 */
export function buildMCPEnvironment(params: {
  connectionString: string;
  username: string;
  password: string;
  config: Partial<CouchbaseMCPConfig>;
  defaultLogFilePath: string;
}): Record<string, string> {
  const { connectionString, username, password, config, defaultLogFilePath } = params;

  const readOnlyMode = config.readOnlyMode ?? true;
  // In read-only mode the server never loads write tools, so disabling them
  // again would only produce noise in the environment.
  const disabledTools = (config.disabledTools ?? []).filter(
    (tool) => !readOnlyMode || !(MCP_WRITE_TOOLS as readonly string[]).includes(tool)
  );
  const confirmationRequiredTools = config.confirmationRequiredTools ?? [];

  const env: Record<string, string> = {
    CB_CONNECTION_STRING: connectionString,
    CB_USERNAME: username,
    CB_PASSWORD: password,
    CB_MCP_READ_ONLY_MODE: String(readOnlyMode),
  };

  if (disabledTools.length > 0) {
    env.CB_MCP_DISABLED_TOOLS = disabledTools.join(',');
  }
  if (confirmationRequiredTools.length > 0) {
    env.CB_MCP_CONFIRMATION_REQUIRED_TOOLS = confirmationRequiredTools.join(',');
  }

  const logLevel = config.logLevel ?? 'info';
  const logSinks = config.logSinks ?? ['stderr'];
  env.CB_MCP_LOG_LEVEL = logLevel;
  env.CB_MCP_LOG_SINKS = logSinks.length > 0 ? logSinks.join(',') : 'stderr';

  // Rotation and retention only mean something once files are being written.
  const logFilePath = resolveLogFilePath(config, defaultLogFilePath);
  if (logFilePath) {
    env.CB_MCP_LOG_FILE = logFilePath;

    const rotationMaxSizeMB = config.logRotationMaxSizeMB;
    if (rotationMaxSizeMB !== undefined) {
      env.CB_MCP_LOG_ROTATION_MAX_SIZE_MB = String(rotationMaxSizeMB);
    }
    const retentionBackupCount = config.logRetentionBackupCount;
    if (retentionBackupCount !== undefined) {
      env.CB_MCP_LOG_RETENTION_BACKUP_COUNT = String(retentionBackupCount);
    }

    for (const level of MCP_LOG_FILE_LEVELS) {
      const levelRotation = config.logRotationMaxSizeMBPerLevel?.[level];
      if (levelRotation !== undefined) {
        env[`CB_MCP_LOG_${level.toUpperCase()}_ROTATION_MAX_SIZE_MB`] = String(levelRotation);
      }
      const levelRetention = config.logRetentionBackupCountPerLevel?.[level];
      if (levelRetention !== undefined) {
        env[`CB_MCP_LOG_${level.toUpperCase()}_RETENTION_BACKUP_COUNT`] = String(levelRetention);
      }
    }
  }

  return env;
}
