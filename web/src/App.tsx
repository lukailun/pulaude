import { useEffect, useRef, useState, useCallback } from 'react';
import { ClaudeEngine, type State } from './engine';
import { createConnection, type StateMessage } from './connection';

interface StateConfig {
  label: string;
  icon: string;
  anim: string;
}

const STATE_CONFIG: Record<State, StateConfig> = {
  IDLE:               { label: 'Idle',                icon: 'bedtime',          anim: 'anim-breathe' },
  INITIALIZING:       { label: 'Initializing',        icon: 'progress_activity', anim: 'anim-spin' },
  THINKING:           { label: 'Thinking',            icon: 'psychology',        anim: 'anim-pulse' },
  COMPACTING_CONTEXT: { label: 'Compacting Context',  icon: 'compress',          anim: 'anim-shrink' },
  READING:            { label: 'Reading',             icon: 'auto_stories',      anim: 'anim-scan' },
  WRITING:            { label: 'Writing',             icon: 'edit_note',         anim: 'anim-blink' },
  EXECUTING:          { label: 'Executing',           icon: 'terminal',          anim: 'anim-spin-fast' },
  APPROVAL:           { label: 'Awaiting Approval',   icon: 'gpp_maybe',         anim: 'anim-pulse-warn' },
  WAITING_ELICITATION:{ label: 'Waiting for Input',   icon: 'chat',              anim: 'anim-bounce' },
  SUBAGENT_RUNNING:   { label: 'Sub-agent Running',   icon: 'hub',               anim: 'anim-orbit' },
  TASK_MANAGEMENT:    { label: 'Task Management',     icon: 'task_alt',          anim: 'anim-check-draw' },
  COMPLETE:           { label: 'Complete',            icon: 'check_circle',      anim: 'anim-success' },
  TOOL_ERROR:         { label: 'Tool Error',          icon: 'error',             anim: 'anim-shake' },
  API_ERROR:          { label: 'API Error',           icon: 'cloud_off',         anim: 'anim-glitch' },
  DISCONNECTED:       { label: 'Disconnected',        icon: 'power_settings_new', anim: 'anim-fade' },
  WORKING:            { label: 'Working',             icon: 'sync',              anim: 'anim-spin' },
  PERMISSION_DENIED:  { label: 'Permission Denied',   icon: 'block',             anim: 'anim-denied' },
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ClaudeEngine | null>(null);
  const [state, setState] = useState<State>('IDLE');
  const [tool, setTool] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const handleStateChange = useCallback((msg: StateMessage) => {
    setState(msg.state);
    setTool(msg.tool || '');
    setAnimKey((k) => k + 1);
    engineRef.current?.transitionTo(msg.state);
  }, []);

  useEffect(() => {
    const engine = new ClaudeEngine(canvasRef.current!);
    engineRef.current = engine;
    engine.start();

    const host = window.location.hostname;
    const wsUrl = `ws://${host}:3847/ws`;
    const conn = createConnection({
      url: wsUrl,
      onStateChange: handleStateChange,
      onConnectionChange: setConnected,
    });

    let wakeLock: WakeLockSentinel | null = null;
    navigator.wakeLock?.request('screen').then((lock) => {
      wakeLock = lock;
    });

    return () => {
      engine.stop();
      conn.disconnect();
      wakeLock?.release();
    };
  }, [handleStateChange]);

  const cfg = STATE_CONFIG[state];

  return (
    <>
      <canvas ref={canvasRef} />
      <div className="overlay">
        <div className="status" key={animKey}>
          <span className={`status-icon material-symbols-rounded ${cfg.anim}`}>
            {cfg.icon}
          </span>
          <div className="status-text">
            <div className="state-name">{cfg.label}</div>
            {tool && <div className="tool-name">{tool}</div>}
          </div>
        </div>
        <div className="connection">
          <span className={`dot ${connected ? 'connected' : ''}`} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </>
  );
}

export default App;
