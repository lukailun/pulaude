# Pulaude

[中文](./README.zh-CN.md)

Pulse for Claude -- a real-time visual status indicator for Claude Code.

Pulaude hooks into Claude Code's lifecycle events and renders an animated pulsing orb in the browser. The orb's color, glow, particle density, and pulse frequency change to reflect what Claude is currently doing -- thinking, reading files, writing code, executing commands, waiting for approval, etc.

## Architecture

```
Claude Code  →  pulaude-hook.cjs  →  Bun server  →  WebSocket  →  Browser (Canvas)
(lifecycle)     (node, reads stdin)    (port 3847)                   (particle engine)
```

Three layers:

- **Hook** -- A Node.js script (`hooks/pulaude-hook.cjs`) that captures Claude Code lifecycle events by reading stdin JSON and POSTs state changes to the server. An auto-start script (`hooks/auto-start.cjs`) automatically launches the server on session start.
- **Server** -- A `Bun.serve()` HTTP + WebSocket server (`server/index.ts`) that receives state updates and broadcasts them to all connected clients.
- **Web** -- A React 19 frontend (`web/`) with a custom HTML5 Canvas 2D particle engine that renders the animated orb.

## States

| State | Color | Description |
|-------|-------|-------------|
| `IDLE` | Blue | Waiting for input |
| `THINKING` | Purple | Processing a prompt or planning |
| `READING` | Cyan | Reading files, searching, or fetching |
| `WRITING` | Orange | Writing or editing code |
| `EXECUTING` | Yellow | Running shell commands |
| `WORKING` | Pink | Using a skill or tool |
| `COMPLETE` | Green | Finished a task |
| `ERROR` | Red | An error occurred |
| `APPROVAL` | Amber | Waiting for user permission |
| `DISCONNECTED` | Gray | Session ended |

## Prerequisites

[Bun](https://bun.sh) must be installed. This project does not use Node.js.

## Quick Start

### Development

Install dependencies:

```sh
bun install
cd server && bun install && cd ..
cd web && bun install && cd ..
```

Install hooks (to track Claude Code sessions):

```sh
bun run install:hooks
```

Start the backend server:

```sh
bun run dev:server
```

In a separate terminal, start the frontend dev server:

```sh
bun run dev:web
```

Open http://localhost:5173 in your browser.

### Production

Build the frontend and start the server:

```sh
bun run build
bun run start
```

The app will be served at http://localhost:3847.

## Project Structure

```
pulaude/
  hooks/
    pulaude-hook.cjs       # Main hook entry point (reads stdin, POSTs to server)
    auto-start.cjs         # Auto-launches Bun server on SessionStart
    install.cjs            # Installs hooks into ~/.claude/settings.json
    uninstall.cjs          # Removes hooks from settings.json
  hooks.json               # Hook definitions (reference/legacy)
  relay.sh                 # Bash relay script (project-level alternative)
  shared/types.ts          # Shared TypeScript types
  server/index.ts          # Bun HTTP + WebSocket server
  web/
    src/
      App.tsx              # Main React component
      connection.ts        # WebSocket client with auto-reconnect
      engine.ts            # Canvas 2D particle animation engine
      global.css           # Styling
      main.tsx             # React entry point
    index.html             # Vite entry HTML
    vite.config.ts         # Vite config with dev proxy
```

## Install Hooks (Global)

To make Pulaude track **all** Claude Code sessions (not just this project), install the hooks into your user-level settings.

```sh
bun install
bun run install:hooks
```

The script will:
1. Copy `pulaude-hook.cjs` and `auto-start.cjs` to `~/.claude/pulaude/`
2. Store the project path for auto-start server discovery
3. Register hooks into `~/.claude/settings.json` (marker-based, preserves existing config)

To uninstall:

```sh
bun run uninstall:hooks
```

## Configuration

The hook script targets `http://localhost:3847/api/state` by default. Override with the `PULAUDA_RELAY_URL` environment variable:

```sh
export PULAUDA_RELAY_URL="http://your-server:3847/api/state"
```

## License

MIT
