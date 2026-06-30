#!/usr/bin/env node
// Pulaude — Auto-Start Script
// Registered as a SessionStart hook. Checks if the Bun server is running;
// if not, launches it detached.

const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const DEFAULT_PORT = 3847;
const PROBE_TIMEOUT_MS = 300;
const STARTUP_READY_TIMEOUT_MS = 6000;
const POLL_INTERVAL_MS = 100;

/**
 * Probe the Pulaude server to check if it's running.
 * Returns true if the server responds with the expected header.
 */
function probeServer(port) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, PROBE_TIMEOUT_MS);

    fetch(`http://127.0.0.1:${port}/api/current`, {
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timer);
        resolve(res.ok);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(false);
      });
  });
}

/**
 * Wait for the server to become ready by polling.
 */
function waitForServer(port, timeoutMs) {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;

    function poll() {
      probeServer(port).then((ready) => {
        if (ready) {
          resolve(true);
        } else if (Date.now() >= deadline) {
          resolve(false);
        } else {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      });
    }

    poll();
  });
}

/**
 * Find the Pulaude project directory.
 * Walks up from the hook script's location to find package.json with name "pulaude".
 */
function findProjectDir() {
  // The hook is installed at ~/.claude/pulaude/auto-start.js
  // The project dir is where the original source lives
  // We need to find it from the installed copy
  const home = os.homedir();

  // Strategy 1: Check if there's a project path stored during install
  const configPath = path.join(home, ".claude", "pulaude", "project-path.txt");
  try {
    const projectPath = fs.readFileSync(configPath, "utf-8").trim();
    if (projectPath && fs.existsSync(path.join(projectPath, "package.json"))) {
      return projectPath;
    }
  } catch {}

  // Strategy 2: Look for the project in common locations
  const candidates = [
    path.join(home, "Desktop", "Projects", "pulaude"),
    path.join(home, "Projects", "pulaude"),
    path.join(home, "pulaude"),
    path.join(home, "code", "pulaude"),
  ];

  for (const candidate of candidates) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(candidate, "package.json"), "utf-8"));
      if (pkg.name === "pulaude") {
        return candidate;
      }
    } catch {}
  }

  return null;
}

/**
 * Launch the Pulaude Bun server detached.
 */
function launchServer(projectDir) {
  const serverScript = path.join(projectDir, "server", "index.ts");

  // Verify the server script exists
  if (!fs.existsSync(serverScript)) {
    console.error(`Pulaude: Server script not found at ${serverScript}`);
    return false;
  }

  const child = spawn("bun", ["run", serverScript], {
    cwd: projectDir,
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });

  child.unref();
  return true;
}

async function main() {
  // Quick probe — is the server already running?
  const alreadyRunning = await probeServer(DEFAULT_PORT);
  if (alreadyRunning) {
    process.exit(0);
  }

  // Find the project directory
  const projectDir = findProjectDir();
  if (!projectDir) {
    // Can't find the project — silently exit, the user will start manually
    process.exit(0);
  }

  // Launch the server
  const launched = launchServer(projectDir);
  if (!launched) {
    process.exit(0);
  }

  // Wait for the server to become ready
  await waitForServer(DEFAULT_PORT, STARTUP_READY_TIMEOUT_MS);
  process.exit(0);
}

main();
