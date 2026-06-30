#!/usr/bin/env node
// Pulaude — Claude Code Hook Script
// Usage: node pulaude-hook.js <event_name>
// Reads stdin JSON from Claude Code and POSTs state to the Pulaude server.

const DEFAULT_SERVER = "http://localhost:3847";
const STATE_PATH = "/api/state";
const STDIN_TIMEOUT_MS = 400;
const DEFAULT_HOOK_TIMEOUT_MS = 100;
const STOP_HOOK_TIMEOUT_MS = 1500;

// Event → Pulaude state mapping
const EVENT_TO_STATE = {
  SessionStart: "INITIALIZING",
  SessionEnd: "DISCONNECTED",
  UserPromptSubmit: "THINKING",
  Stop: "COMPLETE",
  StopFailure: "TOOL_ERROR",
  PreToolUse: "WORKING", // overridden by tool-specific mapping
  PostToolUse: "THINKING",
  PostToolUseFailure: "TOOL_ERROR",
  SubagentStart: "SUBAGENT_RUNNING",
  SubagentStop: "WORKING",
  PreCompact: "COMPACTING_CONTEXT",
  PostCompact: "THINKING",
  Notification: null, // resolved from matcher
  Elicitation: "WAITING_ELICITATION",
  PermissionRequest: "APPROVAL",
};

// PreToolUse tool-specific state mapping
const TOOL_STATE_MAP = {
  Bash: "EXECUTING",
  Read: "READING",
  Glob: "READING",
  Grep: "READING",
  WebFetch: "READING",
  WebSearch: "READING",
  Write: "WRITING",
  Edit: "WRITING",
  MultiEdit: "WRITING",
  NotebookEdit: "WRITING",
  Agent: "SUBAGENT_RUNNING",
  Skill: "SUBAGENT_RUNNING",
  Task: "SUBAGENT_RUNNING",
};

// Notification matcher → state mapping
const NOTIFICATION_STATE_MAP = {
  permission_prompt: "APPROVAL",
  elicitation_dialog: "WAITING_ELICITATION",
  permission_denied: "PERMISSION_DENIED",
  idle_prompt: "IDLE",
};

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

    // If stdin is already closed (piped empty input)
    if (process.stdin.isTTY) {
      clearTimeout(timer);
      resolve({});
    }
  });
}

/**
 * Resolve the Pulaude state for a given event and payload.
 */
function resolveState(event, payload) {
  // PreToolUse / PostToolUse: use tool_name from payload
  if (event === "PreToolUse") {
    const toolName = payload.tool_name || "";
    return TOOL_STATE_MAP[toolName] || "WORKING";
  }

  // Notification: resolve from matcher
  if (event === "Notification") {
    const matcher = payload.matcher || payload.notification_type || "";
    return NOTIFICATION_STATE_MAP[matcher] || "IDLE";
  }

  // SessionEnd with source "clear" → treat as COMPACTING_CONTEXT
  if (event === "SessionEnd" && payload.source === "clear") {
    return "COMPACTING_CONTEXT";
  }

  return EVENT_TO_STATE[event] || "IDLE";
}

/**
 * Build the state message payload.
 */
function buildStateBody(event, payload) {
  const state = resolveState(event, payload);
  const sessionId = payload.session_id || "default";
  const toolName =
    event === "PreToolUse" || event === "PostToolUse" || event === "PostToolUseFailure"
      ? payload.tool_name || ""
      : undefined;

  const body = {
    type: "state_change",
    state,
    timestamp: Date.now(),
    sessionId,
  };

  if (toolName) {
    body.tool = toolName;
  }

  return body;
}

/**
 * POST state to the Pulaude server.
 */
async function postState(body, isCompletionEvent) {
  const server = process.env.PULAUDA_RELAY_URL || DEFAULT_SERVER;
  const timeout = isCompletionEvent ? STOP_HOOK_TIMEOUT_MS : DEFAULT_HOOK_TIMEOUT_MS;

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
  const body = buildStateBody(event, payload);
  const isCompletion = event === "Stop" || event === "StopFailure";

  await postState(body, isCompletion);
  process.exit(0);
}

main();
