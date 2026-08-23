# Couchbase MCP Server Integration

This document describes the MCP (Model Context Protocol) integration in the Couchbase VS Code extension.

## Overview

The extension manages a Couchbase MCP server through VS Code's MCP server definition provider API. Credentials are kept in memory and passed to the server process via environment variables -- nothing is written to `mcp.json` or any other file on disk.

Key points:

- Server definition key: `couchbase`
- Runtime command: `uvx couchbase-mcp-server@1.0.1`
- Auto-start behavior is controlled by `couchbase.mcp.server`
- Credentials flow: VS Code SecretService -> in-memory -> environment variables

### Server version pinning

The server version is pinned to an exact release rather than resolved to whatever `uvx` finds newest, so an upstream release can never change the tool surface or configuration contract of an already-installed extension. The pin lives in `MCP_SERVER_VERSION` in [src/mcp/mcpConfig.ts](src/mcp/mcpConfig.ts) and is the only place the version appears in code.

Bumping it means updating, in the same change:

1. `MCP_SERVER_VERSION` in [src/mcp/mcpConfig.ts](src/mcp/mcpConfig.ts)
2. `MCP_WRITE_TOOLS` in the same file, if the new release adds or renames write tools
3. The tool `enum` lists for `couchbase.mcp.disabledTools` and `couchbase.mcp.confirmationRequiredTools` in `package.json` -- the server ignores unknown tool names with a warning, so a stale list silently does nothing
4. Any new `CB_MCP_*` variables, in `buildMCPEnvironment`

### Scope of the integration

The extension only ever runs the server over `stdio` as a child process, authenticating with the credentials of the active connection. The server's OAuth (`CB_MCP_OAUTH_*`), mTLS/certificate (`CB_CA_CERT_PATH`, `CB_CLIENT_CERT_PATH`, `CB_CLIENT_KEY_PATH`), and network transport (`CB_MCP_TRANSPORT`, `CB_MCP_HOST`, `CB_MCP_PORT`) options are therefore deliberately not surfaced as VS Code settings.

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
| `couchbase.mcp.readOnlyMode` | `boolean` | `true` | When true, all write operations (KV, Query, scope/collection management and index management) are disabled |
| `couchbase.mcp.disabledTools` | `string[]` | `[]` | Select tools to disable from a dropdown of all available MCP tools |
| `couchbase.mcp.confirmationRequiredTools` | `string[]` | `[]` | Select tools that require explicit user confirmation before execution via MCP elicitation |
| `couchbase.mcp.logLevel` | `string` | `"info"` | Log level: `off`, `debug`, `info`, `warning`, `error` |
| `couchbase.mcp.logSinks` | `string[]` | `["stderr"]` | Log destinations: `stderr`, `file`, or both |
| `couchbase.mcp.logFile` | `string` | `""` | Base path the per-level log files derive from; empty uses the extension's storage |
| `couchbase.mcp.logRotationMaxSizeMB` | `number` | `1` | Size in MB at which each per-level log file rotates |
| `couchbase.mcp.logRotationMaxSizeMBPerLevel` | `object` | `{}` | Per-level rotation size overrides, keyed `error`/`warning`/`info`/`debug` |
| `couchbase.mcp.logRetentionBackupCount` | `integer` | `1` | Rotated backups kept per level, excluding the live file |
| `couchbase.mcp.logRetentionBackupCountPerLevel` | `object` | `{}` | Per-level retention overrides, keyed `error`/`warning`/`info`/`debug` |

These settings map to the following environment variables passed to the MCP server, all built in one place by `buildMCPEnvironment` in [src/mcp/mcpConfig.ts](src/mcp/mcpConfig.ts) so the server definition and the exported example config cannot drift apart:

| Setting | Environment Variable |
|---------|---------------------|
| `readOnlyMode` | `CB_MCP_READ_ONLY_MODE` |
| `disabledTools` | `CB_MCP_DISABLED_TOOLS` (comma-separated) |
| `confirmationRequiredTools` | `CB_MCP_CONFIRMATION_REQUIRED_TOOLS` (comma-separated) |
| `logLevel` | `CB_MCP_LOG_LEVEL` |
| `logSinks` | `CB_MCP_LOG_SINKS` (comma-separated) |
| `logFile` | `CB_MCP_LOG_FILE` |
| `logRotationMaxSizeMB` | `CB_MCP_LOG_ROTATION_MAX_SIZE_MB` |
| `logRotationMaxSizeMBPerLevel` | `CB_MCP_LOG_<LEVEL>_ROTATION_MAX_SIZE_MB` |
| `logRetentionBackupCount` | `CB_MCP_LOG_RETENTION_BACKUP_COUNT` |
| `logRetentionBackupCountPerLevel` | `CB_MCP_LOG_<LEVEL>_RETENTION_BACKUP_COUNT` |

The `CB_MCP_LOG_FILE` variable and everything below it are only emitted when `file` is one of the selected sinks -- rotation and retention are meaningless without files to apply them to.

Two behaviours are worth noting:

- **Write tools in read-only mode.** The server does not load any write tool when `readOnlyMode` is on, so listing one in `disabledTools` is a no-op. Those entries are filtered out of `CB_MCP_DISABLED_TOOLS` rather than passed through. The list of write tools for the pinned release is `MCP_WRITE_TOOLS`.
- **Settings changes restart the server.** A change under `couchbase.mcp` fires the provider's change event, so VS Code re-resolves the definition and restarts the server with the new environment. No reload is required.

## Logging

The server logs to `stderr` by default, which surfaces in the MCP server's output channel in VS Code. Adding `file` to `couchbase.mcp.logSinks` turns on the file sink, which writes:

- One rotating file per level, derived from the `couchbase.mcp.logFile` base path by inserting the level name: `mcp_server.debug.log`, `mcp_server.info.log`, `mcp_server.warning.log`, `mcp_server.error.log`. The ERROR file also captures CRITICAL. Only levels at or above `couchbase.mcp.logLevel` get a file.
- A non-rotating `mcp_server_config.log.json` snapshot of the resolved configuration (OS, Python and dependency versions, transport, active logging config, and the redacted server config), overwritten on each start.

When `couchbase.mcp.logFile` is empty, the base path defaults to `mcp-logs/mcp_server.log` inside the extension's global storage, so log files never land in whatever working directory the server process happens to inherit. The extension creates the containing directory before starting the server, and again whenever the setting changes.

Rotation size and retention can be set globally and overridden per level -- for example, keeping a long ERROR history while capping verbose DEBUG output:

```json
{
  "couchbase.mcp.logLevel": "debug",
  "couchbase.mcp.logSinks": ["stderr", "file"],
  "couchbase.mcp.logRotationMaxSizeMB": 1,
  "couchbase.mcp.logRetentionBackupCountPerLevel": { "error": 30, "debug": 0 }
}
```

A retention count of `0` keeps only the live file for that level; it is still capped by the rotation size, and is truncated rather than rotated.

## Start/Stop Semantics

### Start

`Couchbase: Start MCP Server` performs:

1. Active connection lookup
2. Password retrieval from VS Code SecretService
3. Log directory creation, when the `file` sink is enabled
4. Server definition registration via `McpStdioServerDefinition` provider (env vars only)
5. Provider change event fires to notify VS Code

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
- **Couchbase: MCP Server Settings** -- opens VS Code settings filtered to `couchbase.mcp` for configuring read-only mode, disabled tools, logging, and other options
- **Couchbase: Open MCP Server Logs Folder** -- reveals the folder holding the per-level log files, for attaching to a support ticket. Warns and offers to open settings when the `file` sink is not enabled

## Example Configuration (for other IDEs)

The "Get MCP Server Config" command shows an example like this for use in other IDEs:

```json
{
  "mcpServers": {
    "couchbase": {
      "type": "stdio",
      "command": "uvx",
      "args": ["couchbase-mcp-server@1.0.1"],
      "env": {
        "CB_CONNECTION_STRING": "couchbase://localhost",
        "CB_USERNAME": "Administrator",
        "CB_PASSWORD": "<your-password>",
        "CB_MCP_READ_ONLY_MODE": "true",
        "CB_MCP_DISABLED_TOOLS": "upsert_document_by_id,delete_document_by_id",
        "CB_MCP_LOG_LEVEL": "info",
        "CB_MCP_LOG_SINKS": "stderr"
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

- [Couchbase MCP Server GitHub](https://github.com/couchbase/mcp-server-couchbase)
- [Couchbase MCP Server PyPI](https://pypi.org/project/couchbase-mcp-server/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
