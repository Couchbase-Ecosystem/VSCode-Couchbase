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

/**
 * Log IDs for MCP-related operations
 * Using a structured numbering scheme for easy identification
 */
export const MCPLogIds = {
  ConnectError: 3_000_001,
  DisconnectError: 3_000_002,
  UpdateConnectionError: 3_000_003,
  ServerStartError: 3_000_004,
  ServerStopError: 3_000_005,
  ConfigError: 3_000_006,
} as const;
