import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const home = process.env.HOME || process.env.USERPROFILE || "";
const claudeDir = join(home, ".claude");
const hookDir = join(claudeDir, "pulaude");
const settingsPath = join(claudeDir, "settings.json");

// 1. Copy relay.sh
const srcScript = join(import.meta.dir, "..", "relay.sh");
if (!existsSync(hookDir)) mkdirSync(hookDir, { recursive: true });
writeFileSync(join(hookDir, "relay.sh"), readFileSync(srcScript));
console.log(`Copied relay.sh -> ${hookDir}/relay.sh`);

// 2. Merge hooks
const srcSettings = join(import.meta.dir, "..", "hooks.json");
const hooks = JSON.parse(
  readFileSync(srcSettings, "utf-8").replaceAll(
    "$CLAUDE_PROJECT_DIR",
    hookDir
  )
).hooks;

const existing = existsSync(settingsPath)
  ? JSON.parse(readFileSync(settingsPath, "utf-8"))
  : {};

if (existing.hooks) {
  for (const [event, entries] of Object.entries(hooks)) {
    if (!existing.hooks[event]) {
      existing.hooks[event] = entries;
    } else {
      (existing.hooks[event] as unknown[]).push(...(entries as unknown[]));
    }
  }
} else {
  existing.hooks = hooks;
}

writeFileSync(settingsPath, JSON.stringify(existing, null, 2) + "\n");
console.log(`Hooks installed -> ${settingsPath}`);
