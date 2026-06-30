#!/usr/bin/env node
// Pulaude — Hook Installer
// Safely merges hook commands into ~/.claude/settings.json
// Uses marker-based identification to avoid duplicate entries.

const fs = require("fs");
const path = require("path");
const os = require("os");

const MARKER = "pulaude-hook.cjs";
const AUTO_START_MARKER = "auto-start.cjs";
const DEFAULT_TIMEOUT_MS = 5000;

const home = os.homedir();
const claudeDir = path.join(home, ".claude");
const pulaudeDir = path.join(claudeDir, "pulaude");
const settingsPath = path.join(claudeDir, "settings.json");

// Hook definitions: [eventName, matcher?, state]
const HOOK_DEFS = [
  // No matcher (global hooks)
  ["SessionStart", null, "INITIALIZING"],
  ["SessionEnd", null, "DISCONNECTED"],
  ["UserPromptSubmit", null, "THINKING"],
  ["Stop", null, "COMPLETE"],
  ["StopFailure", null, "TOOL_ERROR"],
  ["SubagentStart", null, "SUBAGENT_RUNNING"],
  ["SubagentStop", null, "WORKING"],
  ["PreCompact", null, "COMPACTING_CONTEXT"],
  ["PostCompact", null, "THINKING"],
  ["Elicitation", null, "WAITING_ELICITATION"],
  ["PermissionRequest", null, "APPROVAL"],

  // PreToolUse with matchers
  ["PreToolUse", "Bash", "EXECUTING"],
  ["PreToolUse", "Read", "READING"],
  ["PreToolUse", "Glob", "READING"],
  ["PreToolUse", "Grep", "READING"],
  ["PreToolUse", "WebFetch", "READING"],
  ["PreToolUse", "WebSearch", "READING"],
  ["PreToolUse", "Write", "WRITING"],
  ["PreToolUse", "Edit", "WRITING"],
  ["PreToolUse", "MultiEdit", "WRITING"],
  ["PreToolUse", "NotebookEdit", "WRITING"],
  ["PreToolUse", "Agent", "SUBAGENT_RUNNING"],
  ["PreToolUse", "Skill", "SUBAGENT_RUNNING"],
  ["PreToolUse", "Task", "SUBAGENT_RUNNING"],

  // PostToolUse with matchers
  ["PostToolUse", "Bash", "THINKING"],
  ["PostToolUse", "Read|Glob|Grep|WebFetch|WebSearch", "THINKING"],
  ["PostToolUse", "Write|Edit|MultiEdit|NotebookEdit", "THINKING"],
  ["PostToolUse", "Agent|Skill|Task", "THINKING"],

  // PostToolUseFailure
  ["PostToolUseFailure", null, "TOOL_ERROR"],

  // Notification with matchers
  ["Notification", "permission_prompt", "APPROVAL"],
  ["Notification", "elicitation_dialog", "WAITING_ELICITATION"],
  ["Notification", "permission_denied", "PERMISSION_DENIED"],
  ["Notification", "idle_prompt", "IDLE"],
];

// Events that only need the global (no matcher) version
const GLOBAL_ONLY_EVENTS = new Set([
  "SessionStart",
  "SessionEnd",
  "UserPromptSubmit",
  "Stop",
  "StopFailure",
  "SubagentStart",
  "SubagentStop",
  "PreCompact",
  "PostCompact",
  "Elicitation",
  "PermissionRequest",
  "PostToolUseFailure",
]);

// --- Utilities ---

function readJsonFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    // Strip UTF-8 BOM
    if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function writeJsonAtomic(filePath, data) {
  const tmp = filePath + ".tmp-" + Date.now();
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n");
  fs.renameSync(tmp, filePath);
}

function writeJsonAtomicWithBackup(filePath, data) {
  const backupPath = filePath.replace(/\.json$/, "") + `.pulaude-backup-${Date.now()}.json`;
  try {
    fs.copyFileSync(filePath, backupPath);
  } catch {
    // Backup failed — proceed anyway
  }
  writeJsonAtomic(filePath, data);
}

/**
 * Resolve the absolute path to the node binary.
 * Uses process.execPath (works for both node and bun).
 */
function resolveNodeBin() {
  return process.execPath;
}

/**
 * Build a command hook spec for a given event definition.
 */
function buildCommandHookSpec(nodeBin, hookPath, event, _matcher) {
  const cmd = `"${nodeBin}" "${hookPath}" ${event}`;
  return {
    type: "command",
    command: cmd,
    timeout: DEFAULT_TIMEOUT_MS,
  };
}

/**
 * Find existing hook entries whose command contains the marker string.
 * Searches both flat and nested (entry.hooks[].command) formats.
 */
function findMarkerEntries(entries, marker) {
  const results = [];
  for (const entry of entries) {
    if (entry.type === "command" && entry.command && entry.command.includes(marker)) {
      results.push(entry);
    }
    if (Array.isArray(entry.hooks)) {
      for (const hook of entry.hooks) {
        if (hook.type === "command" && hook.command && hook.command.includes(marker)) {
          results.push(hook);
        }
      }
    }
  }
  return results;
}

/**
 * Check if a hook entry matches our desired spec (same command).
 */
function entryMatchesSpec(entry, desiredCommand) {
  return entry.command === desiredCommand;
}

/**
 * Sync a command hook into the entries array.
 * Matches by both marker AND matcher to avoid collapsing entries with
 * different matchers (e.g., PreToolUse with Bash vs Read).
 * Returns true if the entries array was modified.
 */
function syncHookEntry(entries, desiredSpec, matcher, marker) {
  const desiredCommand = desiredSpec.command;

  // Search for existing entries with our marker AND matching matcher
  for (const entry of entries) {
    // Only consider entries with the same matcher context
    const entryMatcher = entry.matcher || "";
    if (entryMatcher !== (matcher || "")) continue;

    // Check nested format: { matcher: "...", hooks: [...] }
    if (Array.isArray(entry.hooks)) {
      for (const hook of entry.hooks) {
        if (hook.command && hook.command.includes(marker)) {
          if (hook.command === desiredCommand && hook.timeout === desiredSpec.timeout) {
            return false; // Already up to date
          }
          // Update existing
          hook.command = desiredCommand;
          hook.type = "command";
          hook.timeout = desiredSpec.timeout;
          return true;
        }
      }
    }

    // Check flat format: { type: "command", command: "..." }
    if (
      entry.type === "command" &&
      entry.command &&
      entry.command.includes(marker)
    ) {
      if (entry.command === desiredCommand && entry.timeout === desiredSpec.timeout) {
        return false; // Already up to date
      }
      entry.command = desiredCommand;
      entry.type = "command";
      entry.timeout = desiredSpec.timeout;
      return true;
    }
  }

  // No existing entry found — push new
  if (matcher) {
    entries.push({
      matcher,
      hooks: [desiredSpec],
    });
  } else {
    entries.push({
      hooks: [desiredSpec],
    });
  }
  return true;
}

/**
 * Remove all hook entries whose command contains the given marker.
 * Returns the number of entries removed.
 */
function removeMarkerEntries(entries, marker) {
  let removed = 0;
  const filtered = entries.filter((entry) => {
    // Check nested format
    if (Array.isArray(entry.hooks)) {
      const before = entry.hooks.length;
      entry.hooks = entry.hooks.filter(
        (hook) => !(hook.command && hook.command.includes(marker))
      );
      removed += before - entry.hooks.length;
      // Keep entry if it still has hooks
      return entry.hooks.length > 0;
    }

    // Check flat format
    if (entry.type === "command" && entry.command && entry.command.includes(marker)) {
      removed++;
      return false;
    }

    return true;
  });

  // Mutate original array
  entries.length = 0;
  entries.push(...filtered);
  return removed;
}

// --- Main install/uninstall ---

function registerHooks(options = {}) {
  const settingsPathResolved = options.settingsPath || settingsPath;
  const hookDir = options.hookDir || pulaudeDir;
  const nodeBin = resolveNodeBin();
  const hookPath = path.join(hookDir, "pulaude-hook.cjs");
  const autoStartPath = path.join(hookDir, "auto-start.cjs");

  // Read existing settings
  let settings = readJsonFile(settingsPathResolved) || {};
  if (!settings.hooks) settings.hooks = {};

  let changed = false;

  // Register each hook event
  for (const [event, matcher] of HOOK_DEFS) {
    if (!settings.hooks[event]) {
      settings.hooks[event] = [];
    }

    const spec = buildCommandHookSpec(nodeBin, hookPath, event, matcher);
    if (syncHookEntry(settings.hooks[event], spec, matcher, MARKER)) {
      changed = true;
    }
  }

  // Register auto-start.js on SessionStart (prepend)
  if (options.autoStart !== false) {
    if (!settings.hooks.SessionStart) {
      settings.hooks.SessionStart = [];
    }

    const autoStartSpec = {
      type: "command",
      command: `"${nodeBin}" "${autoStartPath}"`,
      timeout: 10000,
    };

    // Check if auto-start is already registered
    const sessionStartEntries = settings.hooks.SessionStart;
    let autoStartFound = false;

    for (const entry of sessionStartEntries) {
      if (Array.isArray(entry.hooks)) {
        for (const hook of entry.hooks) {
          if (hook.command && hook.command.includes(AUTO_START_MARKER)) {
            if (hook.command !== autoStartSpec.command || hook.timeout !== autoStartSpec.timeout) {
              hook.command = autoStartSpec.command;
              hook.timeout = autoStartSpec.timeout;
              changed = true;
            }
            autoStartFound = true;
            break;
          }
        }
      }
      if (autoStartFound) break;
    }

    if (!autoStartFound) {
      // Prepend auto-start before other SessionStart hooks
      sessionStartEntries.unshift({
        hooks: [autoStartSpec],
      });
      changed = true;
    }
  }

  // Write if changed
  if (changed) {
    writeJsonAtomic(settingsPathResolved, settings);
  }

  return { changed, settingsPath: settingsPathResolved };
}

function unregisterHooks(options = {}) {
  const settingsPathResolved = options.settingsPath || settingsPath;

  let settings = readJsonFile(settingsPathResolved);
  if (!settings || !settings.hooks) {
    return { removed: 0, changed: false };
  }

  let totalRemoved = 0;

  for (const event of Object.keys(settings.hooks)) {
    const entries = settings.hooks[event];
    if (!Array.isArray(entries)) continue;

    totalRemoved += removeMarkerEntries(entries, MARKER);
    totalRemoved += removeMarkerEntries(entries, AUTO_START_MARKER);

    // Remove empty event arrays
    if (entries.length === 0) {
      delete settings.hooks[event];
    }
  }

  // Remove hooks key if empty
  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  const changed = totalRemoved > 0;
  if (changed) {
    writeJsonAtomicWithBackup(settingsPathResolved, settings);
  }

  return { removed: totalRemoved, changed };
}

// --- CLI ---

if (require.main === module) {
  const command = process.argv[2];

  if (command === "uninstall" || command === "--uninstall") {
    const result = unregisterHooks();
    if (result.changed) {
      console.log(`Pulaude: Removed ${result.removed} hook(s) from settings.json`);
    } else {
      console.log("Pulaude: No hooks found to remove");
    }
  } else {
    // Ensure pulaude directory exists
    if (!fs.existsSync(pulaudeDir)) {
      fs.mkdirSync(pulaudeDir, { recursive: true });
    }

    // Copy pulaude-hook.cjs and auto-start.cjs to pulaude dir
    const hookSrc = path.join(__dirname, "pulaude-hook.cjs");
    const autoStartSrc = path.join(__dirname, "auto-start.cjs");

    if (fs.existsSync(hookSrc)) {
      fs.copyFileSync(hookSrc, path.join(pulaudeDir, "pulaude-hook.cjs"));
      console.log(`Copied pulaude-hook.cjs -> ${pulaudeDir}/`);
    }
    if (fs.existsSync(autoStartSrc)) {
      fs.copyFileSync(autoStartSrc, path.join(pulaudeDir, "auto-start.cjs"));
      console.log(`Copied auto-start.cjs -> ${pulaudeDir}/`);
    }

    // Store project path for auto-start server discovery
    const projectDir = path.resolve(__dirname, "..");
    const projectPathFile = path.join(pulaudeDir, "project-path.txt");
    fs.writeFileSync(projectPathFile, projectDir + "\n");
    console.log(`Stored project path -> ${projectPathFile}`);

    const result = registerHooks();
    if (result.changed) {
      console.log(`Pulaude: Hooks installed -> ${result.settingsPath}`);
    } else {
      console.log("Pulaude: Hooks already up to date");
    }
  }
}

module.exports = { registerHooks, unregisterHooks };
