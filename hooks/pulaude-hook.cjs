#!/usr/bin/env node
// Pulaude — Claude Code Hook Script
// Usage: node pulaude-hook.cjs <event_name>
// Reads stdin JSON from Claude Code and forwards the raw event to the Pulaude server.
// The server handles state derivation (session tracking, aggregation).

const DEFAULT_SERVER = "http://localhost:3847";
const STATE_PATH = "/api/state";
const STDIN_TIMEOUT_MS = 400;
const DEFAULT_HOOK_TIMEOUT_MS = 100;
const STOP_HOOK_TIMEOUT_MS = 1500;

/**
 * Read stdin JSON with timeout. Returns parsed object or {} on failure.
 */
function readStdinJson() {
  return new Promise((resolve) => {
    let data = "";
    const timer = setTimeout(() => resolve({}), STDIN_TIMEOUT_MS);

    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
    process.stdin.on("error", () => {
      clearTimeout(timer);
      resolve({});
    });

    if (process.stdin.isTTY) {
      clearTimeout(timer);
      resolve({});
    }
  });
}

/**
 * POST event to the Pulaude server.
 */
async function postEvent(event, payload) {
  const server = process.env.PULAUDA_RELAY_URL || DEFAULT_SERVER;
  const isCompletion = event === "Stop" || event === "StopFailure";
  const timeout = isCompletion ? STOP_HOOK_TIMEOUT_MS : DEFAULT_HOOK_TIMEOUT_MS;

  const body = {
    event,
    sessionId: payload.session_id || "default",
    tool: payload.tool_name || undefined,
    timestamp: Date.now(),
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    await fetch(`${server}${STATE_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);
  } catch {
    // Silent fail — hook must not block Claude Code
  }
}

async function main() {
  const event = process.argv[2];
  if (!event) {
    process.exit(0);
  }

  const payload = await readStdinJson();
  await postEvent(event, payload);
  process.exit(0);
}

main();
