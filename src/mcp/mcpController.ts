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
import { IConnection } from '../types/IConnection';
import { MCPConnectionManager } from './mcpConnectionManager';
import {
  buildMCPEnvironment,
  getMCPConfigFromVSCodeSettings,
  isFileLoggingEnabled,
  MCP_SERVER_PACKAGE_SPEC,
  resolveLogDirectory,
} from './mcpConfig';
import { MCPLogIds } from './mcpLogIds';
import { SecretService } from '../util/secretService';
import { Constants } from '../util/constants';

export type MCPServerStartupConfig = 'prompt' | 'autoStartEnabled' | 'autoStartDisabled';

type MCPServerInfo = {
  connectionString: string;
  username: string;
  password: string;
};

type MCPControllerConfig = {
  context: vscode.ExtensionContext;
  onActiveConnectionChanged: (callback: () => Promise<void>) => void;
  getActiveConnection: () => IConnection | undefined;
};

/**
 * Main controller for MCP server integration in Couchbase VS Code extension
 * Manages server lifecycle, connection state, and auto-start behavior.
 *
 * Credentials are kept in memory and passed to the MCP server process via
 * environment variables through the VS Code MCP server definition provider.
 * No credentials are persisted to disk (e.g. mcp.json).
 */
export class MCPController {
  private static readonly MCP_SERVER_NAME = 'couchbase';

  /** Directory under the extension's global storage holding the per-level log files. */
  private static readonly LOG_DIRECTORY_NAME = 'mcp-logs';

  /** Base file name the server derives `mcp_server.info.log`, `mcp_server.error.log`, ... from. */
  private static readonly LOG_FILE_NAME = 'mcp_server.log';

  private context: vscode.ExtensionContext;
  private getActiveConnection: () => IConnection | undefined;
  private mcpConnectionManager: MCPConnectionManager;
  private serverInfo?: MCPServerInfo;
  private didChangeEmitter = new vscode.EventEmitter<void>();

  constructor({ context, onActiveConnectionChanged, getActiveConnection }: MCPControllerConfig) {
    this.context = context;
    this.getActiveConnection = getActiveConnection;
    this.mcpConnectionManager = new MCPConnectionManager();

    onActiveConnectionChanged(() => this.onActiveConnectionChanged());

    logger.debug('MCPController initialized');
  }

  public async activate(): Promise<void> {
    try {
      await this.migrateOldConfigToNewConfig(this.getMCPAutoStartConfig<unknown>());

      this.context.subscriptions.push(
        vscode.lm.registerMcpServerDefinitionProvider(MCPController.MCP_SERVER_NAME, {
          onDidChangeMcpServerDefinitions: this.didChangeEmitter.event,
          provideMcpServerDefinitions: () => {
            const config = this.getServerConfig();
            return config ? [config] : [];
          },
          resolveMcpServerDefinition: (server: vscode.McpServerDefinition) => {
            return server;
          },
        })
      );

      this.context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (event) => {
          if (event.affectsConfiguration('couchbase.mcp') && this.serverInfo) {
            logger.info('MCP settings changed, updating server definition');
            // The log sink or path may have just changed, so make sure the
            // destination exists before the server is restarted with it.
            await this.ensureLogDirectory();
            this.didChangeEmitter.fire();
          }
        })
      );

      if (this.getMCPAutoStartConfig() === 'autoStartEnabled') {
        await this.startServer();
      }

      logger.info('MCPController activated');
    } catch (error) {
      logger.error(
        `MCPLogId: ${MCPLogIds.ServerStartError} - Error activating MCPController: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async migrateOldConfigToNewConfig(oldConfig: unknown): Promise<void> {
    try {
      switch (oldConfig) {
        case 'ask':
        case 'enabled': {
          await this.setMCPAutoStartConfig('prompt');
          break;
        }
        case 'disabled': {
          await this.setMCPAutoStartConfig('autoStartDisabled');
          break;
        }
        default: {
          break;
        }
      }
    } catch (error) {
      logger.error(`Error migrating old MCP config: ${error}`);
    }
  }

  private async promptForMCPAutoStart(): Promise<void> {
    try {
      const autoStartConfig = this.getMCPAutoStartConfig();
      const shouldPrompt = autoStartConfig === 'prompt';

      logger.debug(`Checking if MCP auto-start prompt should be shown - config: ${autoStartConfig}, shouldPrompt: ${shouldPrompt}, serverRunning: ${!!this.serverInfo}`);

      if (!shouldPrompt) {
        return;
      }

      const notificationActions = this.serverInfo
        ? (['Auto-Start', 'Never'] as const)
        : (['Auto-Start', 'Start Once', 'Never'] as const);

      const promptResponse = await vscode.window.showInformationMessage(
        'Would you like to automatically start the Couchbase MCP server for a streamlined experience? When started, the server will automatically connect to your active Couchbase instance.',
        ...notificationActions
      );

      switch (promptResponse) {
        case 'Auto-Start': {
          await this.setMCPAutoStartConfig('autoStartEnabled');
          await this.startServer();
          break;
        }
        case 'Start Once': {
          await this.startServer();
          break;
        }
        case 'Never': {
          await this.setMCPAutoStartConfig('autoStartDisabled');
          if (this.serverInfo) {
            await this.stopServer();
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      logger.error(`Error prompting for MCP auto-start: ${error}`);
    }
  }

  private async getConnectionPassword(connection: IConnection): Promise<string> {
    const secretService = SecretService.getInstance(this.context);
    const connectionId = `${connection.username}@${connection.url}`;
    const password = await secretService.get(`${Constants.extensionID}-${connectionId}`);
    return password || '';
  }

  public async startServer(): Promise<void> {
    try {
      if (this.serverInfo) {
        logger.info('MCP server is already configured and running');
        return;
      }

      const activeConnection = this.getActiveConnection();
      if (!activeConnection) {
        return;
      }

      logger.info('Starting Couchbase MCP server');

      const password = await this.getConnectionPassword(activeConnection);
      this.serverInfo = {
        connectionString: activeConnection.url,
        username: activeConnection.username,
        password,
      };

      const connectionParams = MCPConnectionManager.fromConnection(activeConnection);
      await this.mcpConnectionManager.updateConnection(connectionParams);

      await this.ensureLogDirectory();

      this.didChangeEmitter.fire();

      const settingsAction = 'MCP Settings';
      vscode.window.showInformationMessage(
        'Couchbase MCP server started successfully. Configure read-only mode, disabled tools, and more in MCP Settings.',
        settingsAction
      ).then((selection) => {
        if (selection === settingsAction) {
          void MCPController.openMcpSettings();
        }
      });
      logger.info('Couchbase MCP server started successfully');
    } catch (error) {
      logger.error(
        `MCPLogId: ${MCPLogIds.ServerStartError} - Error starting MCP server: ${error instanceof Error ? error.message : String(error)}`
      );
      vscode.window.showErrorMessage(`Failed to start Couchbase MCP server: ${error}`);
    }
  }

  public async stopServer(): Promise<void> {
    try {
      logger.info('Stopping Couchbase MCP server');

      if (this.serverInfo) {
        await this.mcpConnectionManager.disconnect();
      }
      this.serverInfo = undefined;
      this.didChangeEmitter.fire();

      vscode.window.showInformationMessage('Couchbase MCP server stopped');
      logger.info('Couchbase MCP server stopped successfully');
    } catch (error) {
      logger.error(
        `MCPLogId: ${MCPLogIds.ServerStopError} - Error stopping MCP server: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Shows the server configuration in a temporary untitled document.
   * Does not create a physical file; credentials are not persisted to disk.
   */
  public async openServerConfig(): Promise<boolean> {
    const config = this.getServerConfig();
    if (!config) {
      void vscode.window.showErrorMessage(
        'Couchbase MCP Server is not running. Start the server by running "Couchbase: Start MCP Server" from the command palette.'
      );
      return false;
    }

    try {
      const documentUri = vscode.Uri.from({
        path: 'couchbase-mcp-config.json',
        scheme: 'untitled',
      });

      const envVars = buildMCPEnvironment({
        connectionString: this.serverInfo!.connectionString,
        username: this.serverInfo!.username,
        password: '<your-password>',
        config: getMCPConfigFromVSCodeSettings(),
        defaultLogFilePath: this.getDefaultLogFilePath(),
      });

      const jsonConfig = JSON.stringify(
        {
          mcpServers: {
            [MCPController.MCP_SERVER_NAME]: {
              type: 'stdio',
              command: 'uvx',
              args: [MCP_SERVER_PACKAGE_SPEC],
              env: envVars,
            },
          },
        },
        null,
        2
      );

      const edit = new vscode.WorkspaceEdit();
      edit.insert(
        documentUri,
        new vscode.Position(0, 0),
        `// Example config - refer to your IDE's docs for exact configuration details\n// Note that the extension manages credentials securely in memory and they\n// are not persisted to disk. Replace <your-password> with your actual\n// password if configuring manually for a different IDE.\n${jsonConfig}`
      );
      await vscode.workspace.applyEdit(edit);

      const document = await vscode.workspace.openTextDocument(documentUri);
      await vscode.languages.setTextDocumentLanguage(document, 'json');
      await vscode.window.showTextDocument(document);
      return true;
    } catch (error) {
      void vscode.window.showErrorMessage(
        `Unable to create a config document: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  /**
   * Returns the server definition for VS Code's MCP provider.
   * Credentials are passed via environment variables so they remain in memory
   * and are never written to a config file on disk.
   */
  private getServerConfig(): vscode.McpStdioServerDefinition | undefined {
    if (!this.serverInfo) {
      return undefined;
    }

    const activeConnection = this.getActiveConnection();

    if (!activeConnection) {
      return undefined;
    }

    return new vscode.McpStdioServerDefinition(
      `Couchbase MCP Server (${activeConnection.connectionIdentifier})`,
      'uvx',
      [MCP_SERVER_PACKAGE_SPEC],
      buildMCPEnvironment({
        connectionString: this.serverInfo.connectionString,
        username: this.serverInfo.username,
        password: this.serverInfo.password,
        config: getMCPConfigFromVSCodeSettings(),
        defaultLogFilePath: this.getDefaultLogFilePath(),
      })
    );
  }

  /**
   * Base path for the per-level log files when the user enables the file sink
   * without naming a path. Lives in the extension's global storage so the
   * files are per-install and never depend on the working directory the
   * server process inherits.
   */
  private getDefaultLogFilePath(): string {
    return vscode.Uri.joinPath(
      this.context.globalStorageUri,
      MCPController.LOG_DIRECTORY_NAME,
      MCPController.LOG_FILE_NAME
    ).fsPath;
  }

  /**
   * Creates the directory the log files are written to. The server logs an
   * error and carries on when a log file cannot be opened, so a failure here
   * is reported but never blocks the server from starting.
   */
  private async ensureLogDirectory(): Promise<void> {
    const logDirectory = resolveLogDirectory(
      getMCPConfigFromVSCodeSettings(),
      this.getDefaultLogFilePath()
    );
    if (!logDirectory) {
      return;
    }

    try {
      await vscode.workspace.fs.createDirectory(vscode.Uri.file(logDirectory));
      logger.debug(`MCP log directory ready: ${logDirectory}`);
    } catch (error) {
      logger.error(
        `MCPLogId: ${MCPLogIds.ServerStartError} - Unable to create MCP log directory '${logDirectory}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Reveals the folder holding the per-level MCP log files, for attaching to a
   * support ticket. Only meaningful once the `file` log sink is enabled.
   */
  public async openLogsFolder(): Promise<void> {
    const mcpConfig = getMCPConfigFromVSCodeSettings();

    if (!isFileLoggingEnabled(mcpConfig)) {
      const settingsAction = 'MCP Settings';
      const selection = await vscode.window.showWarningMessage(
        'Couchbase MCP server log files are not being written. Add "file" to the "couchbase.mcp.logSinks" setting to generate the log files required for product support.',
        settingsAction
      );
      if (selection === settingsAction) {
        void MCPController.openMcpSettings();
      }
      return;
    }

    const logDirectory = vscode.Uri.file(
      resolveLogDirectory(mcpConfig, this.getDefaultLogFilePath())!
    );

    try {
      await vscode.workspace.fs.createDirectory(logDirectory);
      // The per-level files (mcp_server.info.log, mcp_server.error.log, ...)
      // only exist once the server has logged at that level, so reveal the
      // directory rather than a file that may not be there yet.
      await vscode.commands.executeCommand('revealFileInOS', logDirectory);
    } catch (error) {
      void vscode.window.showErrorMessage(
        `Unable to open the MCP log folder '${logDirectory.fsPath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async onActiveConnectionChanged(): Promise<void> {
    try {
      const activeConnection = this.getActiveConnection();

      logger.debug(`Active connection changed - connectionId: ${activeConnection?.connectionIdentifier}, serverStarted: ${!!this.serverInfo}`);

      if (activeConnection) {
        void this.promptForMCPAutoStart();
      }

      if (activeConnection && !this.serverInfo && this.getMCPAutoStartConfig() === 'autoStartEnabled') {
        await this.startServer();
        return;
      }

      if (this.serverInfo && activeConnection) {
        const connectionParams = MCPConnectionManager.fromConnection(activeConnection);
        await this.mcpConnectionManager.updateConnection(connectionParams);

        const password = await this.getConnectionPassword(activeConnection);
        this.serverInfo = {
          connectionString: activeConnection.url,
          username: activeConnection.username,
          password,
        };

        this.didChangeEmitter.fire();
      } else if (this.serverInfo && !activeConnection) {
        await this.stopServer();
      }
    } catch (error) {
      logger.error(`Error handling active connection change: ${error}`);
    }
  }

  private getMCPAutoStartConfig<ConfigValue = MCPServerStartupConfig>():
    | ConfigValue
    | undefined {
    return vscode.workspace.getConfiguration().get<ConfigValue>('couchbase.mcp.server');
  }

  private async setMCPAutoStartConfig(config: MCPServerStartupConfig): Promise<void> {
    await vscode.workspace.getConfiguration().update('couchbase.mcp.server', config, true);
  }

  public static async openMcpSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', 'couchbase.mcp');
  }

  public dispose(): void {
    void this.stopServer();
    this.didChangeEmitter.dispose();
  }
}
