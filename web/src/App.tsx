import { useEffect, useRef, useState } from 'react';
import { ClaudeEngine, type State } from './engine';
import { createConnection, type StateMessage } from './connection';

const STATE_LABELS: Record<State, string> = {
  IDLE: 'Idle',
  THINKING: 'Thinking',
  READING: 'Reading',
  WRITING: 'Writing',
  EXECUTING: 'Executing',
  WORKING: 'Working',
  COMPLETE: 'Complete',
  ERROR: 'Error',
  APPROVAL: 'Awaiting Approval',
  DISCONNECTED: 'Disconnected',
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ClaudeEngine | null>(null);
  const [state, setState] = useState<State>('IDLE');
  const [tool, setTool] = useState<string>('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // 启动动画引擎
    const engine = new ClaudeEngine(canvasRef.current!);
    engineRef.current = engine;
    engine.start();

    // 连接 WebSocket
    const host = window.location.hostname;
    const wsUrl = `ws://${host}:3847/ws`;
    const conn = createConnection({
      url: wsUrl,
      onStateChange: (msg: StateMessage) => {
        setState(msg.state);
        setTool(msg.tool || '');
        engine.transitionTo(msg.state);
      },
      onConnectionChange: setConnected,
    });

    // 屏幕常亮
    let wakeLock: WakeLockSentinel | null = null;
    navigator.wakeLock?.request('screen').then((lock) => {
      wakeLock = lock;
    });

    return () => {
      engine.stop();
      conn.disconnect();
      wakeLock?.release();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} />
      <div className="status">
        <div className="state-name">{STATE_LABELS[state]}</div>
        {tool && <div className="tool-name">{tool}</div>}
      </div>
      <div className="connection">
        <span className={`dot ${connected ? 'connected' : ''}`} />
        {connected ? 'Connected' : 'Disconnected'}
      </div>
    </>
  );
}

export default App;
