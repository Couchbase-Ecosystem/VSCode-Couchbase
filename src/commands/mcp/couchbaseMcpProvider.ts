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
import { logger } from '../../logger/logger';
import { Memory } from '../../util/util';
import { Constants } from '../../util/constants';
import { IConnection } from '../../types/IConnection';
import ConnectionEvents from '../../util/events/connectionEvents';

export class CouchbaseMcpProvider implements vscode.McpServerDefinitionProvider {
    private _onDidChangeMcpServerDefinitions = new vscode.EventEmitter<void>();
    readonly onDidChangeMcpServerDefinitions = this._onDidChangeMcpServerDefinitions.event;

    constructor() {
        // Listen for connection changes to refresh MCP server definitions
        ConnectionEvents.onConnectionChanged(() => {
            this._onDidChangeMcpServerDefinitions.fire();
        });
        
        ConnectionEvents.onConnectionRemoved(() => {
            this._onDidChangeMcpServerDefinitions.fire();
        });
    }

    async provideMcpServerDefinitions(): Promise<vscode.McpServerDefinition[]> {
        try {
            const activeConnection = Memory.state.get<IConnection>(Constants.ACTIVE_CONNECTION);
            
            if (!activeConnection) {
                logger.info('No active Couchbase connection found for MCP server');
                return [];
            }

            // Try uvx first, fallback to Docker if uvx is not available
            const mcpServerDefinitions: vscode.McpStdioServerDefinition[] = [];

            // Primary option: uvx-based execution
            const uvxServerDefinition: vscode.McpStdioServerDefinition = {
                label: `Couchbase MCP Server (${activeConnection.connectionIdentifier})`,
                command: 'uvx',
                args: [
                    'couchbase-mcp-server',
                    '--connection-string', activeConnection.url,
                    '--username', activeConnection.username,
                    '--password', activeConnection.password || '',
                    '--read-only-query-mode', 'false'
                ],
                env: {
                    CB_CONNECTION_STRING: activeConnection.url,
                    CB_USERNAME: activeConnection.username,
                    CB_PASSWORD: activeConnection.password || ''
                }
            };

            mcpServerDefinitions.push(uvxServerDefinition);

            // // Alternative option: Docker-based execution
            // const dockerServerDefinition: vscode.McpStdioServerDefinition = {
            //     label: `Couchbase MCP Server - Docker (${activeConnection.connectionIdentifier})`,
            //     command: 'docker',
            //     args: [
            //         'run',
            //         '--rm',
            //         '-i',
            //         '-e', `CB_CONNECTION_STRING=${activeConnection.url}`,
            //         '-e', `CB_USERNAME=${activeConnection.username}`,
            //         '-e', `CB_PASSWORD=${activeConnection.password || ''}`,
            //         '-e', 'CB_MCP_READ_ONLY_QUERY_MODE=false',
            //         'couchbaseecosystem/mcp-server-couchbase:latest'
            //     ],
            //     env: {}
            // };

            // mcpServerDefinitions.push(dockerServerDefinition);

            logger.info(`Providing ${mcpServerDefinitions.length} MCP server definitions for connection: ${activeConnection.connectionIdentifier}`);
            return mcpServerDefinitions;

        } catch (error) {
            logger.error(`Error providing MCP server definitions: ${error}`);
            return [];
        }
    }

    async resolveMcpServerDefinition(definition: vscode.McpServerDefinition): Promise<vscode.McpServerDefinition> {
        try {
            // Validate that we still have an active connection
            const activeConnection = Memory.state.get<IConnection>(Constants.ACTIVE_CONNECTION);
            
            if (!activeConnection) {
                throw new Error('No active Couchbase connection available');
            }

            // Ensure the connection is still valid
            if (!activeConnection.cluster) {
                throw new Error('Couchbase cluster connection is not established');
            }

            logger.info(`Resolving MCP server definition: ${definition.label}`);
            return definition;

        } catch (error) {
            logger.error(`Error resolving MCP server definition: ${error}`);
            throw error;
        }
    }


    dispose() {
        this._onDidChangeMcpServerDefinitions.dispose();
    }
}
