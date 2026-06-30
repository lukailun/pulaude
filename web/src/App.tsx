import { useEffect, useRef, useState, useCallback } from 'react';
import { ClaudeEngine, type BuddyState } from './engine';
import { createConnection, type StateMessage } from './connection';

interface StateConfig {
  label: string;
  icon: string;
  anim: string;
}

const STATE_CONFIG: Record<BuddyState, StateConfig> = {
  idle:      { label: 'Idle',      icon: 'bedtime',           anim: 'anim-breathe' },
  busy:      { label: 'Busy',      icon: 'sync',              anim: 'anim-spin' },
  attention: { label: 'Attention', icon: 'gpp_maybe',         anim: 'anim-pulse-warn' },
  celebrate: { label: 'Celebrate', icon: 'check_circle',      anim: 'anim-success' },
  error:     { label: 'Error',     icon: 'error',             anim: 'anim-shake' },
  sleep:     { label: 'Sleep',     icon: 'power_settings_new', anim: 'anim-fade' },
  love:      { label: 'Love',      icon: 'favorite',          anim: 'anim-pulse' },
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ClaudeEngine | null>(null);
  const [state, setState] = useState<BuddyState>('sleep');
  const [connected, setConnected] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [showSettings, setShowDebugPanel] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoState, setDemoState] = useState<BuddyState>('idle');

  const handleStateChange = useCallback((msg: StateMessage) => {
    if (demoMode) return;
    setState(msg.state);
    setAnimKey((k) => k + 1);
    engineRef.current?.transitionTo(msg.state);
  }, [demoMode]);

  const handleDemoStateSelect = useCallback((s: BuddyState) => {
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
          {(Object.keys(STATE_CONFIG) as BuddyState[]).map((s) => (
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
