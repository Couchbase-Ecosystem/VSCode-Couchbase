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
import * as path from 'path';
import * as jsonc from 'jsonc-parser';
import { logger } from '../logger/logger';
import { IConnection } from '../types/IConnection';
import { MCPConnectionManager } from './mcpConnectionManager';
import { getMCPConfigFromVSCodeSettings } from './mcpConfig';
import { MCPLogIds } from './mcpLogIds';

export type MCPServerStartupConfig = 'prompt' | 'autoStartEnabled' | 'autoStartDisabled';

type MCPServerInfo = {
  connectionString: string;
  username: string;
  headers?: Record<string, string>;
};

type MCPControllerConfig = {
  context: vscode.ExtensionContext;
  onActiveConnectionChanged: (callback: () => Promise<void>) => void;
  getActiveConnection: () => IConnection | undefined;
};

type MCPJsonConfiguration = {
  servers?: Record<string, unknown>;
  inputs?: unknown[];
  [key: string]: unknown;
};

/**
 * Main controller for MCP server integration in Couchbase VS Code extension
 * Manages server lifecycle, connection state, and auto-start behavior
 */
export class MCPController {
  private static readonly MCP_SERVER_NAME = 'couchbase';
  private static readonly USER_MCP_CONFIG_FILE = 'mcp.json';
  private static readonly USER_LOCAL_MCP_SERVER_ID_PREFIX = 'mcp.config.usrlocal';
  private static readonly LEGACY_PROVIDER_SERVER_ID = 'couchbase';
  private static readonly MCP_PASSWORD_INPUT_ID = 'couchbaseMcpPassword';
  private static readonly MCP_PASSWORD_INPUT_REFERENCE = `\${input:${MCPController.MCP_PASSWORD_INPUT_ID}}`;

  private context: vscode.ExtensionContext;
  private getActiveConnection: () => IConnection | undefined;
  private mcpConnectionManager: MCPConnectionManager;
  private serverInfo?: MCPServerInfo;
  private didChangeEmitter = new vscode.EventEmitter<void>();

  constructor({ context, onActiveConnectionChanged, getActiveConnection }: MCPControllerConfig) {
    this.context = context;
    this.getActiveConnection = getActiveConnection;
    this.mcpConnectionManager = new MCPConnectionManager();

    // Listen for connection changes
    onActiveConnectionChanged(() => this.onActiveConnectionChanged());

    logger.debug('MCPController initialized');
  }

  /**
   * Activates the MCP controller
   */
  public async activate(): Promise<void> {
    try {
      await this.migrateOldConfigToNewConfig(this.getMCPAutoStartConfig<unknown>());

      this.context.subscriptions.push(
        vscode.lm.registerMcpServerDefinitionProvider('couchbase', {
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

      // Auto-start if configured
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

  /**
   * Migrates old config values to new config format
   */
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
          // Config is already in new format or doesn't exist
          break;
        }
      }
    } catch (error) {
      logger.error(`Error migrating old MCP config: ${error}`);
    }
  }

  /**
   * Prompts user to configure MCP auto-start
   */
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

  /**
   * Starts the MCP server
   */
  public async startServer(): Promise<void> {
    try {
      if (this.serverInfo) {
        await this.startServerInVSCode();
        logger.info('MCP server is already configured and running');
        return;
      }

      const activeConnection = this.getActiveConnection();
      if (!activeConnection) {
        return;
      }

      logger.info('Starting Couchbase MCP server');

      this.serverInfo = {
        connectionString: activeConnection.url,
        username: activeConnection.username,
      };

      const connectionParams = MCPConnectionManager.fromConnection(activeConnection);

      // Update the connection manager
      await this.mcpConnectionManager.updateConnection(connectionParams);

      try {
        await this.syncServerConfigToMcpJson();
      } catch (error) {
        logger.warn(`Could not sync Couchbase MCP server to mcp.json: ${error}`);
      }

      await this.startServerInVSCode();
      this.didChangeEmitter.fire();

      vscode.window.showInformationMessage('Couchbase MCP server started successfully');
      logger.info('Couchbase MCP server started successfully');
    } catch (error) {
      logger.error(
        `MCPLogId: ${MCPLogIds.ServerStartError} - Error starting MCP server: ${error instanceof Error ? error.message : String(error)}`
      );
      vscode.window.showErrorMessage(`Failed to start Couchbase MCP server: ${error}`);
    }
  }

  /**
   * Stops the MCP server
   */
  public async stopServer(): Promise<void> {
    try {
      logger.info('Stopping Couchbase MCP server');

      await this.stopServerInVSCode();

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
   * Adds or updates the server configuration in mcp.json and opens the file
   */
  public async openServerConfig(): Promise<boolean> {
    if (!this.getServerConfig()) {
      void vscode.window.showErrorMessage(
        'Couchbase MCP Server is not running. Start the server by running "Couchbase: Start MCP Server" from the command palette.'
      );
      return false;
    }

    try {
      const mcpConfigUri = await this.syncServerConfigToMcpJson();
      if (!mcpConfigUri) {
        return false;
      }

      const document = await vscode.workspace.openTextDocument(mcpConfigUri);
      await vscode.window.showTextDocument(document);
      void vscode.window.showInformationMessage(
        'Couchbase MCP server configuration has been updated in mcp.json.'
      );

      return true;
    } catch (error) {
      void vscode.window.showErrorMessage(
        `Unable to update mcp.json: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  private async syncServerConfigToMcpJson(): Promise<vscode.Uri | undefined> {
    const activeConnection = this.getActiveConnection();
    if (!activeConnection) {
      return undefined;
    }

    const mcpConfig = getMCPConfigFromVSCodeSettings();
    const mcpConfigUri = this.getUserMcpConfigUri();
    const existingConfig = await this.readUserMcpConfiguration(mcpConfigUri);
    const servers = this.getServersConfiguration(existingConfig);
    const existingServerConfig = servers[MCPController.MCP_SERVER_NAME];

    servers[MCPController.MCP_SERVER_NAME] = this.buildUpdatedMcpServerConfiguration(
      existingServerConfig,
      activeConnection,
      mcpConfig.readOnlyMode ?? true
    );

    existingConfig.servers = servers;
    existingConfig.inputs = this.withPasswordInput(existingConfig.inputs);

    await vscode.workspace.fs.createDirectory(vscode.Uri.file(path.dirname(mcpConfigUri.fsPath)));
    await this.writeUserMcpConfiguration(mcpConfigUri, existingConfig);

    return mcpConfigUri;
  }

  private async writeUserMcpConfiguration(
    mcpConfigUri: vscode.Uri,
    config: MCPJsonConfiguration
  ): Promise<void> {
    let existingContent: string | undefined;
    try {
      const fileData = await vscode.workspace.fs.readFile(mcpConfigUri);
      existingContent = new TextDecoder('utf-8').decode(fileData);
    } catch {
      logger.warn(`No existing mcp.json found at ${mcpConfigUri.fsPath}. A new file will be created.`);
    }

    let newContent: string;
    if (existingContent !== undefined) {
      const formattingOptions: jsonc.FormattingOptions = {
        insertSpaces: true,
        tabSize: 2,
        eol: '\n',
      };

      let content = existingContent;
      try {
        const couchbaseServerConfig =
          config.servers && typeof config.servers === 'object' && !Array.isArray(config.servers)
            ? (config.servers[MCPController.MCP_SERVER_NAME] as unknown)
            : undefined;

        if (couchbaseServerConfig !== undefined) {
          const serverEdits = jsonc.modify(
            content,
            ['servers', MCPController.MCP_SERVER_NAME],
            couchbaseServerConfig,
            { formattingOptions }
          );
          content = jsonc.applyEdits(content, serverEdits);
        }

        if (Array.isArray(config.inputs)) {
          const inputsEdits = jsonc.modify(content, ['inputs'], config.inputs, {
            formattingOptions,
          });
          content = jsonc.applyEdits(content, inputsEdits);
        }
      } catch {
        // If we cannot apply JSONC edits (for example malformed content),
        // rewrite with a normalized JSON document.
        content = `${JSON.stringify(config, null, 2)}\n`;
      }

      if (!content.endsWith('\n')) {
        content += '\n';
      }
      newContent = content;
    } else {
      newContent = `${JSON.stringify(config, null, 2)}\n`;
    }

    const mcpConfigContent = new TextEncoder().encode(newContent);
    await vscode.workspace.fs.writeFile(mcpConfigUri, mcpConfigContent);
  }

  private async startServerInVSCode(): Promise<void> {
    const retryDelaysInMs = [0, 300, 900];

    for (const retryDelayInMs of retryDelaysInMs) {
      if (retryDelayInMs > 0) {
        await this.delay(retryDelayInMs);
      }

      try {
        await vscode.commands.executeCommand(
          'workbench.mcp.startServer',
          this.getUserLocalMcpServerId(),
          {
            autoTrustChanges: true,
            waitForLiveTools: true,
          }
        );
      } catch (error) {
        logger.warn(`Unable to start MCP server in VS Code: ${error}`);
      }
    }
  }

  private async stopServerInVSCode(): Promise<void> {
    try {
      await vscode.commands.executeCommand('workbench.mcp.stopServer', this.getUserLocalMcpServerId());
      await vscode.commands.executeCommand(
        'workbench.mcp.stopServer',
        MCPController.LEGACY_PROVIDER_SERVER_ID
      );
    } catch (error) {
      logger.warn(`Unable to stop MCP server in VS Code: ${error}`);
    }
  }

  private async restartServerInVSCode(): Promise<void> {
    try {
      await vscode.commands.executeCommand(
        'workbench.mcp.restartServer',
        this.getUserLocalMcpServerId(),
        { autoTrustChanges: true }
      );
    } catch (error) {
      logger.warn(`Unable to restart MCP server in VS Code: ${error}`);
    }
  }

  private async delay(timeoutInMs: number): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, timeoutInMs);
    });
  }

  private getUserLocalMcpServerId(): string {
    return `${MCPController.USER_LOCAL_MCP_SERVER_ID_PREFIX}.${MCPController.MCP_SERVER_NAME}`;
  }

  private getUserMcpConfigUri(): vscode.Uri {
    const userConfigDirectory = path.dirname(path.dirname(this.context.globalStorageUri.fsPath));
    return vscode.Uri.file(path.join(userConfigDirectory, MCPController.USER_MCP_CONFIG_FILE));
  }

  private async readUserMcpConfiguration(mcpConfigUri: vscode.Uri): Promise<MCPJsonConfiguration> {
    try {
      const fileContent = new TextDecoder().decode(await vscode.workspace.fs.readFile(mcpConfigUri));
      if (!fileContent.trim()) {
        return {};
      }

      const parseErrors: jsonc.ParseError[] = [];
      const parsedConfig = jsonc.parse(fileContent, parseErrors, {
        allowTrailingComma: true,
        disallowComments: false,
      });

      if (parseErrors.length > 0) {
        logger.warn(
          `mcp.json had parsing issues (${parseErrors
            .map((error) => jsonc.printParseErrorCode(error.error))
            .join(', ')}). Rewriting with updated Couchbase server configuration.`
        );
      }

      if (parsedConfig && typeof parsedConfig === 'object' && !Array.isArray(parsedConfig)) {
        return parsedConfig as MCPJsonConfiguration;
      }

      return {};
    } catch (error) {
      if (error instanceof vscode.FileSystemError && error.code === 'FileNotFound') {
        return {};
      }

      throw error;
    }
  }

  private getServersConfiguration(config: MCPJsonConfiguration): Record<string, unknown> {
    if (config.servers && typeof config.servers === 'object' && !Array.isArray(config.servers)) {
      return { ...config.servers };
    }

    return {};
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  private normalizeArgs(args: unknown): string[] {
    if (!Array.isArray(args)) {
      return [];
    }

    return args.filter((arg): arg is string => typeof arg === 'string');
  }

  private getArgValue(args: string[], flag: string): string | undefined {
    const keyValueArg = args.find((arg) => arg.startsWith(`${flag}=`));
    if (keyValueArg) {
      return keyValueArg.slice(flag.length + 1);
    }

    const flagIndex = args.findIndex((arg) => arg === flag);
    if (flagIndex !== -1 && flagIndex + 1 < args.length) {
      return args[flagIndex + 1];
    }

    return undefined;
  }

  private removeArg(args: string[], flag: string): string[] {
    const nextArgs: string[] = [];

    for (let index = 0; index < args.length; index += 1) {
      const arg = args[index];
      if (arg === flag) {
        index += 1;
        continue;
      }

      if (arg.startsWith(`${flag}=`)) {
        continue;
      }

      nextArgs.push(arg);
    }

    return nextArgs;
  }

  private upsertArg(args: string[], flag: string, value: string): string[] {
    const keyValueArgIndex = args.findIndex((arg) => arg.startsWith(`${flag}=`));
    if (keyValueArgIndex !== -1) {
      const updatedArgs = [...args];
      updatedArgs[keyValueArgIndex] = `${flag}=${value}`;
      return updatedArgs;
    }

    const flagArgIndex = args.findIndex((arg) => arg === flag);
    if (flagArgIndex !== -1) {
      const updatedArgs = [...args];
      if (flagArgIndex + 1 < updatedArgs.length) {
        updatedArgs[flagArgIndex + 1] = value;
      } else {
        updatedArgs.push(value);
      }
      return updatedArgs;
    }

    return [...args, flag, value];
  }

  private withPasswordInput(inputs: unknown): unknown[] {
    const existingInputs = Array.isArray(inputs) ? [...inputs] : [];
    const withoutPasswordInput = existingInputs.filter((entry) => {
      if (!this.isRecord(entry)) {
        return true;
      }

      return entry.id !== MCPController.MCP_PASSWORD_INPUT_ID;
    });

    withoutPasswordInput.push({
      id: MCPController.MCP_PASSWORD_INPUT_ID,
      type: 'promptString',
      description: 'Enter Couchbase password for MCP server',
      password: true,
    });

    return withoutPasswordInput;
  }

  private buildUpdatedMcpServerConfiguration(
    existingServerConfig: unknown,
    activeConnection: IConnection,
    defaultReadOnlyMode: boolean
  ): Record<string, unknown> {
    const hasExistingServerConfig = this.isRecord(existingServerConfig);
    const serverConfig: Record<string, unknown> = hasExistingServerConfig
      ? { ...existingServerConfig }
      : {
          type: 'stdio',
          command: 'uvx',
          args: ['couchbase-mcp-server'],
        };

    let args = this.normalizeArgs(serverConfig.args);
    if (args.length === 0) {
      args = ['couchbase-mcp-server'];
    }

    args = this.upsertArg(args, '--connection-string', activeConnection.url);
    args = this.upsertArg(args, '--username', activeConnection.username);
    args = this.upsertArg(args, '--password', MCPController.MCP_PASSWORD_INPUT_REFERENCE);

    const deprecatedReadOnlyMode = this.getArgValue(args, '--read-only-query-mode');
    const currentReadOnlyMode = this.getArgValue(args, '--read-only-mode');

    args = this.removeArg(args, '--read-only-query-mode');

    if (deprecatedReadOnlyMode !== undefined && currentReadOnlyMode === undefined) {
      args = this.upsertArg(args, '--read-only-mode', deprecatedReadOnlyMode);
    } else if (!hasExistingServerConfig && currentReadOnlyMode === undefined) {
      args = this.upsertArg(args, '--read-only-mode', String(defaultReadOnlyMode));
    }

    serverConfig.args = args;

    if (this.isRecord(serverConfig.env)) {
      const env = { ...serverConfig.env };
      delete env.CB_CONNECTION_STRING;
      delete env.CB_USERNAME;
      delete env.CB_PASSWORD;

      if (Object.keys(env).length > 0) {
        serverConfig.env = env;
      } else {
        delete serverConfig.env;
      }
    }

    return serverConfig;
  }

  /**
   * Gets the server configuration
   */
  private getServerConfig(): vscode.McpStdioServerDefinition | undefined {
    if (!this.serverInfo) {
      return undefined;
    }

    const mcpConfig = getMCPConfigFromVSCodeSettings();
    const activeConnection = this.getActiveConnection();
    
    if (!activeConnection) {
      return undefined;
    }

    return new vscode.McpStdioServerDefinition(
      `Couchbase MCP Server (${activeConnection.connectionIdentifier})`,
      'uvx',
      [
        'couchbase-mcp-server',
        '--connection-string',
        this.serverInfo.connectionString,
        '--username',
        this.serverInfo.username,
        '--password',
        MCPController.MCP_PASSWORD_INPUT_REFERENCE,
        '--read-only-mode',
        String(mcpConfig.readOnlyMode ?? true),
      ],
      {
        ...(mcpConfig.exportsPath && { CB_MCP_EXPORTS_PATH: mcpConfig.exportsPath }),
      }
    );
  }

  /**
   * Handles active connection changes
   */
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

      // Update the connection if server is running
      if (this.serverInfo && activeConnection) {
        const connectionParams = MCPConnectionManager.fromConnection(activeConnection);
        await this.mcpConnectionManager.updateConnection(connectionParams);

        // Update server info
        this.serverInfo = {
          connectionString: activeConnection.url,
          username: activeConnection.username,
        };

        try {
          await this.syncServerConfigToMcpJson();
          await this.restartServerInVSCode();
          this.didChangeEmitter.fire();
        } catch (error) {
          logger.warn(`Could not sync Couchbase MCP server to mcp.json: ${error}`);
        }
      } else if (this.serverInfo && !activeConnection) {
        // No active connection, stop the server
        await this.stopServer();
      }
    } catch (error) {
      logger.error(`Error handling active connection change: ${error}`);
    }
  }

  /**
   * Gets the MCP auto-start configuration
   */
  private getMCPAutoStartConfig<ConfigValue = MCPServerStartupConfig>():
    | ConfigValue
    | undefined {
    return vscode.workspace.getConfiguration().get<ConfigValue>('couchbase.mcp.server');
  }

  /**
   * Sets the MCP auto-start configuration
   */
  private async setMCPAutoStartConfig(config: MCPServerStartupConfig): Promise<void> {
    await vscode.workspace.getConfiguration().update('couchbase.mcp.server', config, true);
  }

  /**
   * Disposes the controller
   */
  public dispose(): void {
    this.didChangeEmitter.dispose();
    void this.stopServer();
  }
}
