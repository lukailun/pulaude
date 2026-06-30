#!/usr/bin/env node
// Pulaude — Hook Uninstaller
// Thin CLI wrapper that removes Pulaude hooks from ~/.claude/settings.json.

const { unregisterHooks } = require("./install.cjs");

const result = unregisterHooks();
if (result.changed) {
  console.log(`Pulaude: Removed ${result.removed} hook(s) from settings.json`);
} else {
  console.log("Pulaude: No hooks found to remove");
}
