# Pulaude

[中文](./README.zh-CN.md)

Pulse for Claude -- a real-time visual status indicator for Claude Code.

Pulaude hooks into Claude Code's lifecycle events and renders an animated pulsing orb in the browser. The orb's color, glow, particle density, and pulse frequency change to reflect what Claude is currently doing -- thinking, reading files, writing code, executing commands, waiting for approval, etc.

## Architecture

```
Claude Code  →  hook/relay.sh  →  Bun server  →  WebSocket  →  Browser (Canvas)
(lifecycle)     (curl POST)       (port 3847)                   (particle engine)
```

Three layers:

- **Hook** -- A bash script (`hook/relay.sh`) that captures Claude Code lifecycle events via `.claude/settings.json` and POSTs state changes to the server.
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
  .claude/settings.json   # Claude Code hook definitions
  hook/relay.sh            # Bash relay script
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

## Configuration

The relay script targets `http://localhost:3847/api/state` by default. Override with the `CLAUDE_RELAY_URL` environment variable:

```sh
export CLAUDE_RELAY_URL="http://your-server:3847/api/state"
```

## License

MIT
