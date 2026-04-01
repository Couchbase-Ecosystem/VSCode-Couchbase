# Couchbase MCP Server Integration

This document describes the MCP (Model Context Protocol) integration in the Couchbase VS Code extension.

## Overview

The extension manages a Couchbase MCP server through VS Code's MCP server definition provider API. Credentials are kept in memory and passed to the server process via environment variables -- nothing is written to `mcp.json` or any other file on disk.

Key points:

- Server definition key: `couchbase`
- Runtime command: `uvx couchbase-mcp-server`
- Auto-start behavior is controlled by `couchbase.mcp.server`
- Credentials flow: VS Code SecretService -> in-memory -> environment variables

## Credential Security

The extension follows the same pattern as the MongoDB VS Code extension:

- **No disk persistence**: Credentials are never written to `mcp.json` or any config file.
- **SecretService**: The password is retrieved from VS Code's encrypted SecretService (OS keychain).
- **Environment variables**: Connection string, username, and password are passed to the MCP server process via `CB_CONNECTION_STRING`, `CB_USERNAME`, and `CB_PASSWORD` environment variables through the `McpStdioServerDefinition` provider.
- **Virtual config view**: The "Get MCP Server Config" command opens an untitled document (in-memory only) with a password placeholder (`<your-password>`), never the real value.

## VS Code Settings

All MCP settings are under `couchbase.mcp.*` and can be accessed via the command palette: **Couchbase: MCP Server Settings**.
When the MCP server starts, the success notification includes an "MCP Settings" button that opens these settings directly.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `couchbase.mcp.server` | `string` | `"prompt"` | Auto-start mode: `prompt`, `autoStartEnabled`, `autoStartDisabled` |
| `couchbase.mcp.readOnlyMode` | `boolean` | `true` | When true, all write operations (KV and Query) are disabled |
| `couchbase.mcp.disabledTools` | `string[]` | `[]` | Select tools to disable from a dropdown of all available MCP tools |
| `couchbase.mcp.confirmationRequiredTools` | `string[]` | `[]` | Select tools that require explicit user confirmation before execution via MCP elicitation |
| `couchbase.mcp.exportsPath` | `string` | `""` | Directory for MCP server data exports |

These settings map to the following environment variables passed to the MCP server:

| Setting | Environment Variable |
|---------|---------------------|
| `readOnlyMode` | `CB_MCP_READ_ONLY_MODE` |
| `disabledTools` | `CB_MCP_DISABLED_TOOLS` (comma-separated) |
| `confirmationRequiredTools` | `CB_MCP_CONFIRMATION_REQUIRED_TOOLS` (comma-separated) |
| `exportsPath` | `CB_MCP_EXPORTS_PATH` |

## Start/Stop Semantics

### Start

`Couchbase: Start MCP Server` performs:

1. Active connection lookup
2. Password retrieval from VS Code SecretService
3. Server definition registration via `McpStdioServerDefinition` provider (env vars only)
4. Provider change event fires to notify VS Code

### Stop

`Couchbase: Stop MCP Server` performs:

1. MCP connection teardown
2. Server info cleared from memory
3. Provider change event fires (empty definitions)

## Auto-Start Modes

Setting: `couchbase.mcp.server`

- `prompt` (default): asks user (`Auto-Start`, `Start Once`, `Never`)
- `autoStartEnabled`: starts automatically on cluster connect
- `autoStartDisabled`: does not auto-start

## Commands

- **Couchbase: Start MCP Server** -- starts the MCP server for the active connection
- **Couchbase: Stop MCP Server** -- stops the running MCP server
- **Couchbase: Get MCP Server Config** -- opens a temporary untitled document showing the current config (credentials are not displayed)
- **Couchbase: MCP Server Settings** -- opens VS Code settings filtered to `couchbase.mcp` for configuring read-only mode, disabled tools, and other options

## Example Configuration (for other IDEs)

The "Get MCP Server Config" command shows an example like this for use in other IDEs:

```json
{
  "mcpServers": {
    "couchbase": {
      "type": "stdio",
      "command": "uvx",
      "args": ["couchbase-mcp-server"],
      "env": {
        "CB_CONNECTION_STRING": "couchbase://localhost",
        "CB_USERNAME": "Administrator",
        "CB_PASSWORD": "<your-password>",
        "CB_MCP_READ_ONLY_MODE": "true",
        "CB_MCP_DISABLED_TOOLS": "upsert_document_by_id,delete_document_by_id"
      }
    }
  }
}
```

> Note: Within VS Code, credentials are managed automatically by the extension. This example is provided for manual setup in other IDEs.

## Confirmation Required Tools (Elicitation)

You can require explicit user confirmation for specific tools before execution using the `couchbase.mcp.confirmationRequiredTools` setting. When a listed tool is invoked:

- If the MCP client supports elicitation, the user is prompted to confirm before the tool runs.
- If the client does not support elicitation, the tool executes without confirmation for backward compatibility.

This is useful for destructive operations like `delete_document_by_id` or `replace_document_by_id` where you want an extra safety check.

The setting maps to the `CB_MCP_CONFIRMATION_REQUIRED_TOOLS` environment variable (comma-separated list of tool names).

Example environment variable usage for other IDEs:

```json
{
  "env": {
    "CB_MCP_CONFIRMATION_REQUIRED_TOOLS": "delete_document_by_id,replace_document_by_id"
  }
}
```

## References

- [Couchbase MCP Server GitHub](https://github.com/Couchbase-Ecosystem/mcp-server-couchbase)
- [Couchbase MCP Server PyPI](https://pypi.org/project/couchbase-mcp-server/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
