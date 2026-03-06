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

import { logger } from '../logger/logger';
import { MCPLogIds } from './mcpLogIds';
import { IConnection } from '../types/IConnection';

export interface MCPConnectParams {
  connectionId: string;
  connectionString: string;
  username: string;
  password?: string;
}

export interface MCPConnectionState {
  connected: boolean;
  connectionId?: string;
  error?: string;
}

/**
 * Manages MCP server connections to Couchbase clusters
 * This class handles the connection lifecycle for MCP servers
 */
export class MCPConnectionManager {
  private activeConnection: {
    id: string;
    params: MCPConnectParams;
  } | null = null;

  private connectionState: MCPConnectionState = {
    connected: false,
  };

  constructor() {
    logger.debug('MCPConnectionManager initialized');
  }

  /**
   * Connects to a Couchbase cluster using provided connection parameters
   */
  async connect(params: MCPConnectParams): Promise<MCPConnectionState> {
    try {
      logger.info(`Connecting MCP server to Couchbase cluster: ${params.connectionId}`);

      // Validate connection parameters
      if (!params.connectionString || !params.username) {
        throw new Error('Missing required connection parameters');
      }

      // Store the active connection
      this.activeConnection = {
        id: params.connectionId,
        params: params,
      };

      this.connectionState = {
        connected: true,
        connectionId: params.connectionId,
      };

      logger.info(`MCP server successfully connected to: ${params.connectionId}`);
      return this.connectionState;
    } catch (error) {
      logger.error(
        `MCPLogId: ${MCPLogIds.ConnectError} - Error connecting MCP server: ${error instanceof Error ? error.message : String(error)}`
      );

      this.connectionState = {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      };

      return this.connectionState;
    }
  }

  /**
   * Disconnects the active MCP connection
   */
  async disconnect(): Promise<void> {
    try {
      if (this.activeConnection) {
        logger.info(`Disconnecting MCP server from: ${this.activeConnection.id}`);
        this.activeConnection = null;
      }

      this.connectionState = {
        connected: false,
      };

      logger.info('MCP server disconnected successfully');
    } catch (error) {
      logger.error(
        `MCPLogId: ${MCPLogIds.DisconnectError} - Error disconnecting MCP server: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Updates the connection to a new Couchbase cluster
   */
  async updateConnection(params: MCPConnectParams | undefined): Promise<void> {
    try {
      // If same connection, no need to update
      if (params?.connectionId === this.activeConnection?.id) {
        logger.debug('Connection already active, skipping update');
        return;
      }

      // Disconnect from current connection
      await this.disconnect();

      // Connect to new cluster if params provided
      if (params) {
        await this.connect(params);
      }
    } catch (error) {
      logger.error(
        `MCPLogId: ${MCPLogIds.UpdateConnectionError} - Error updating MCP connection: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gets the current connection state
   */
  getConnectionState(): MCPConnectionState {
    return this.connectionState;
  }

  /**
   * Gets the active connection parameters
   */
  getActiveConnection(): MCPConnectParams | null {
    return this.activeConnection?.params || null;
  }

  /**
   * Creates connection parameters from IConnection
   */
  static fromConnection(connection: IConnection): MCPConnectParams {
    return {
      connectionId: connection.connectionIdentifier,
      connectionString: connection.url,
      username: connection.username,
      password: connection.password,
    };
  }
}
