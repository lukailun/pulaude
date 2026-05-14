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
  const [showSettings, setShowDebugPanel] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoState, setDemoState] = useState<State>('IDLE');

  const handleStateChange = useCallback((msg: StateMessage) => {
    if (demoMode) return;
    setState(msg.state);
    setTool(msg.tool || '');
    setAnimKey((k) => k + 1);
    engineRef.current?.transitionTo(msg.state);
  }, [demoMode]);

  const handleDemoStateSelect = useCallback((s: State) => {
    setDemoState(s);
    setState(s);
    setAnimKey((k) => k + 1);
    engineRef.current?.transitionTo(s);
  }, []);

  const handleToggleDemoMode = useCallback(() => {
    setDemoMode((prev) => {
      if (!prev) {
        setState(demoState);
        setAnimKey((k) => k + 1);
        engineRef.current?.transitionTo(demoState);
      }
      return !prev;
    });
  }, [demoState]);

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
      <div className="overlay" onClick={() => setShowDebugPanel((v) => !v)}>
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

      <div className={`settings-drawer ${showSettings ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span>Settings</span>
          <button className="settings-close" onClick={() => setShowDebugPanel(false)}>×</button>
        </div>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={demoMode}
            onChange={handleToggleDemoMode}
          />
          <span>Demo Mode</span>
        </label>
        <div className="settings-states">
          {(Object.keys(STATE_CONFIG) as State[]).map((s) => (
            <button
              key={s}
              className={`settings-state-btn ${demoState === s ? 'active' : ''}`}
              onClick={() => handleDemoStateSelect(s)}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                {STATE_CONFIG[s].icon}
              </span>
              {STATE_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
