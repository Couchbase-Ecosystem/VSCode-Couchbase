# Couchbase MCP Server Integration

This document describes the current MCP (Model Context Protocol) integration behavior in the Couchbase VS Code extension.

## Overview

The extension manages a Couchbase MCP server definition in VS Code user `mcp.json` and controls server lifecycle through VS Code MCP commands.

Key points:

- Server definition key: `servers.couchbase`
- Runtime command: `uvx couchbase-mcp-server`
- Auto-start behavior is controlled by `couchbase.mcp.server`

## mcp.json Integration

The extension writes to the VS Code user MCP config file and keeps a `couchbase` server entry up to date.

Example entry:

```json
{
  "servers": {
    "couchbase": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "couchbase-mcp-server",
        "--connection-string",
        "couchbase://localhost",
        "--username",
        "Administrator",
        "--password",
        "********",
        "--read-only-query-mode",
        "true"
      ],
      "env": {
        "CB_CONNECTION_STRING": "couchbase://localhost",
        "CB_USERNAME": "Administrator",
        "CB_PASSWORD": "********"
      }
    }
  },
  "inputs": []
}
```

## Start/Stop Semantics

### Start

`Couchbase: Start MCP Server` performs:

1. Active connection lookup
2. Password resolution from SecretStorage when needed
3. `mcp.json` upsert for `servers.couchbase`
4. VS Code MCP start command invocation

### Stop

`Couchbase: Stop MCP Server` performs:

1. VS Code MCP stop command invocation
2. Extension-side MCP connection teardown

The `servers.couchbase` entry is intentionally kept in `mcp.json`.

## Auto-Start Modes

Setting: `couchbase.mcp.server`

- `prompt` (default): asks user (`Auto-Start`, `Start Once`, `Never`)
- `autoStartEnabled`: starts automatically on cluster connect
- `autoStartDisabled`: does not auto-start

## Commands

- **Couchbase: Start MCP Server**
- **Couchbase: Stop MCP Server**
- **Couchbase: Get MCP Server Config** (updates and opens user `mcp.json`)

## References

- [Couchbase MCP Server GitHub](https://github.com/Couchbase-Ecosystem/mcp-server-couchbase)
- [Couchbase MCP Server PyPI](https://pypi.org/project/couchbase-mcp-server/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
