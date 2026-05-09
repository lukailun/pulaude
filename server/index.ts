import type { ServerWebSocket } from 'bun';
import type { StateMessage } from '../shared/types';

const clients = new Set<ServerWebSocket>();
let currentState: StateMessage = {
  type: 'state_change',
  state: 'IDLE',
  timestamp: Date.now(),
  sessionId: 'default',
};

Bun.serve({
  port: 3847,

  async fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket 升级
    if (url.pathname === '/ws') {
      if (server.upgrade(req)) return;
      return new Response('Upgrade failed', { status: 500 });
    }

    // 接收 Hook 推送
    if (url.pathname === '/api/state' && req.method === 'POST') {
      const event = (await req.json()) as StateMessage;
      currentState = event;
      const msg = JSON.stringify(event);
      for (const ws of clients) {
        ws.send(msg);
      }
      return Response.json({ ok: true });
    }

    // 获取当前状态
    if (url.pathname === '/api/current') {
      return Response.json(currentState);
    }

    // 生产环境：serve 前端静态文件
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file(`./web/dist${filePath}`);
    if (await file.exists()) return new Response(file);
    return new Response(Bun.file('./web/dist/index.html'));
  },

  websocket: {
    open(ws) {
      clients.add(ws);
      // 新连接时立即推送当前状态
      ws.send(JSON.stringify(currentState));
    },
    close(ws) {
      clients.delete(ws);
    },
    message() {},
  },
});

console.log('Pulaude running on http://localhost:3847');
