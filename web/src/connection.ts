import type { State } from './engine';

export interface StateMessage {
  type: 'state_change';
  state: State;
  tool?: string;
  timestamp: number;
}

interface ConnectionOptions {
  url: string;
  onStateChange: (msg: StateMessage) => void;
  onConnectionChange: (connected: boolean) => void;
}

export function createConnection(options: ConnectionOptions) {
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout>;

  function connect() {
    ws = new WebSocket(options.url);

    ws.onopen = () => {
      options.onConnectionChange(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as StateMessage;
        options.onStateChange(msg);
      } catch {}
    };

    ws.onclose = () => {
      options.onConnectionChange(false);
      // 2秒后重连
      reconnectTimer = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      ws?.close();
    };
  }

  connect();

  return {
    disconnect() {
      clearTimeout(reconnectTimer);
      ws?.close();
    },
  };
}
