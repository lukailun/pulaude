import { useEffect, useState, useCallback, useRef } from 'react';
import { createConnection, type StateMessage } from './connection';
import type { BuddyState } from './engine';

interface StateConfig {
  label: string;
  icon: string;
  gif: string;
}

const IDLE_GIFS = [
  'idle_0.gif', 'idle_1.gif', 'idle_2.gif', 'idle_3.gif', 'idle_4.gif',
  'idle_5.gif', 'idle_6.gif', 'idle_7.gif', 'idle_8.gif',
];

const STATE_CONFIG: Record<BuddyState, StateConfig> = {
  idle:      { label: 'Idle',      icon: 'bedtime',           gif: '' }, // random from IDLE_GIFS
  busy:      { label: 'Busy',      icon: 'sync',              gif: 'busy.gif' },
  attention: { label: 'Attention', icon: 'gpp_maybe',         gif: 'attention.gif' },
  celebrate: { label: 'Celebrate', icon: 'check_circle',      gif: 'celebrate.gif' },
  error:     { label: 'Error',     icon: 'error',             gif: 'dizzy.gif' },
  sleep:     { label: 'Sleep',     icon: 'power_settings_new', gif: 'sleep.gif' },
  love:      { label: 'Love',      icon: 'favorite',          gif: 'heart.gif' },
};

const GIF_BASE = '/characters/bufo';

function pickIdleGif(): string {
  return IDLE_GIFS[Math.floor(Math.random() * IDLE_GIFS.length)];
}

function gifForState(state: BuddyState): string {
  if (state === 'idle') return `${GIF_BASE}/${pickIdleGif()}`;
  return `${GIF_BASE}/${STATE_CONFIG[state].gif}`;
}

function App() {
  const [state, setState] = useState<BuddyState>('sleep');
  const [gifSrc, setGifSrc] = useState(`${GIF_BASE}/sleep.gif`);
  const [connected, setConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoState, setDemoState] = useState<BuddyState>('idle');
  const idleRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rotate idle GIF every 5s
  useEffect(() => {
    if (state === 'idle' && !demoMode) {
      idleRotateRef.current = setInterval(() => {
        setGifSrc(gifForState('idle'));
      }, 5000);
      return () => { if (idleRotateRef.current) clearInterval(idleRotateRef.current); };
    } else {
      if (idleRotateRef.current) clearInterval(idleRotateRef.current);
    }
  }, [state, demoMode]);

  const handleStateChange = useCallback((msg: StateMessage) => {
    if (demoMode) return;
    setState(msg.state);
    setGifSrc(gifForState(msg.state));
  }, [demoMode]);

  const handleDemoStateSelect = useCallback((s: BuddyState) => {
    setDemoState(s);
    setState(s);
    setGifSrc(gifForState(s));
  }, []);

  const handleToggleDemoMode = useCallback(() => {
    setDemoMode((prev) => {
      if (!prev) {
        setState(demoState);
        setGifSrc(gifForState(demoState));
      }
      return !prev;
    });
  }, [demoState]);

  useEffect(() => {
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
      conn.disconnect();
      wakeLock?.release();
    };
  }, [handleStateChange]);

  const cfg = STATE_CONFIG[state];

  return (
    <>
      <div className="gif-container">
        <img src={gifSrc} alt={state} className="gif-character" key={gifSrc} />
      </div>

      <div className="overlay" onClick={() => setShowSettings((v) => !v)}>
        <div className="status">
          <span className="status-icon material-symbols-rounded">
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
          <button className="settings-close" onClick={() => setShowSettings(false)}>×</button>
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
