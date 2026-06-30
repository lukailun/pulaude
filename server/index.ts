import type { ServerWebSocket } from 'bun';
import type { BuddyState, StateMessage } from '../shared/types';

const clients = new Set<ServerWebSocket>();

// --- Session tracking ---

interface Session {
  id: string;
  startedAt: number;
  lastEventAt: number;
}

const sessions = new Map<string, Session>();
let recentlyCompleted = false;
let completedTimeout: ReturnType<typeof setTimeout> | null = null;

const SESSION_STALE_MS = 30_000; // remove sessions silent for 30s
const CELEBRATE_DURATION_MS = 5_000; // celebrate state lasts 5s

// --- State derivation (mirrors claude-desktop-buddy) ---

function deriveState(): BuddyState {
  // Clean up stale sessions
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.lastEventAt > SESSION_STALE_MS) {
      sessions.delete(id);
    }
  }

  if (recentlyCompleted) return 'celebrate';
  if (sessions.size === 0) return 'sleep';

  let running = 0;
  let waiting = 0;
  for (const s of sessions.values()) {
    if ((s as any).waiting) waiting++;
    else running++;
  }

  if (waiting > 0) return 'attention';
  if (running >= 3) return 'busy';
  return 'idle';
}

let currentState: StateMessage = {
  type: 'state_change',
  state: 'sleep',
  timestamp: Date.now(),
  sessionId: 'default',
};

function broadcastState() {
  const state = deriveState();
  currentState = {
    type: 'state_change',
    state,
    timestamp: Date.now(),
    sessionId: 'server',
  };
  const msg = JSON.stringify(currentState);
  for (const ws of clients) {
    ws.send(msg);
  }
}

// --- Event processing ---

function processEvent(event: string, sessionId: string, payload: any) {
  const now = Date.now();

  switch (event) {
    case 'SessionStart': {
      sessions.set(sessionId, {
        id: sessionId,
        startedAt: now,
        lastEventAt: now,
        waiting: false,
      } as any);
      recentlyCompleted = false;
      if (completedTimeout) { clearTimeout(completedTimeout); completedTimeout = null; }
      break;
    }

    case 'SessionEnd': {
      sessions.delete(sessionId);
      break;
    }

    case 'Stop': {
      sessions.delete(sessionId);
      recentlyCompleted = true;
      if (completedTimeout) clearTimeout(completedTimeout);
      completedTimeout = setTimeout(() => {
        recentlyCompleted = false;
        broadcastState();
      }, CELEBRATE_DURATION_MS);
      break;
    }

    case 'PermissionRequest': {
      const s = sessions.get(sessionId);
      if (s) {
        (s as any).waiting = true;
        s.lastEventAt = now;
      }
      break;
    }

    // All other events: update lastEventAt, clear waiting
    default: {
      const s = sessions.get(sessionId);
      if (s) {
        s.lastEventAt = now;
        (s as any).waiting = false;
      } else {
        // Session not tracked yet — register it
        sessions.set(sessionId, {
          id: sessionId,
          startedAt: now,
          lastEventAt: now,
          waiting: false,
        } as any);
      }
      break;
    }
  }

  broadcastState();
}

// --- Server ---

Bun.serve({
  port: 3847,

  async fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === '/ws') {
      if (server.upgrade(req)) return;
      return new Response('Upgrade failed', { status: 500 });
    }

    // Receive hook events
    if (url.pathname === '/api/state' && req.method === 'POST') {
      const body = (await req.json()) as any;

      // New format: { event, sessionId, ... }
      if (body.event) {
        processEvent(body.event, body.sessionId || 'default', body);
      }
      // Legacy format: { state, ... } — accept directly
      else if (body.state) {
        currentState = body as StateMessage;
        const msg = JSON.stringify(currentState);
        for (const ws of clients) {
          ws.send(msg);
        }
      }

      return Response.json({ ok: true }, {
        headers: { 'x-pulaude-server': 'pulaude' },
      });
    }

    // Get current state
    if (url.pathname === '/api/current') {
      return Response.json(currentState, {
        headers: { 'x-pulaude-server': 'pulaude' },
      });
    }

    // Serve static files
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file(`./web/dist${filePath}`);
    if (await file.exists()) return new Response(file);
    return new Response(Bun.file('./web/dist/index.html'));
  },

  websocket: {
    open(ws) {
      clients.add(ws);
      ws.send(JSON.stringify(currentState));
    },
    close(ws) {
      clients.delete(ws);
    },
    message() {},
  },
});

console.log('Pulaude running on http://localhost:3847');
