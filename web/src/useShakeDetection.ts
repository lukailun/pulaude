import { useEffect, useRef, useCallback, useState } from 'react';

const SHAKE_THRESHOLD = 25; // acceleration magnitude threshold
const SHAKE_INTERVAL = 300; // min ms between shake detections
const DIZZY_DURATION = 3000; // ms to show dizzy state

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

interface ShakeOptions {
  onShake: () => void;
  enabled?: boolean;
}

function needsPermission(): boolean {
  if (typeof DeviceMotionEvent === 'undefined') return false;
  const DME = DeviceMotionEvent as unknown as {
    requestPermission?: () => Promise<string>;
  };
  return typeof DME.requestPermission === 'function';
}

export function useShakeDetection({ onShake, enabled = true }: ShakeOptions) {
  const lastShakeRef = useRef(0);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
  const motionListenerRef = useRef(false);
  const [permission, setPermission] = useState<PermissionState>(() => {
    if (typeof DeviceMotionEvent === 'undefined') return 'unsupported';
    const DME = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    // iOS needs explicit permission; other platforms grant implicitly
    return typeof DME.requestPermission === 'function' ? 'prompt' : 'granted';
  });

  const handleMotion = useCallback(
    (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

      const { x, y, z } = acc;
      const prev = lastAccelRef.current;
      const delta = Math.abs(x - prev.x) + Math.abs(y - prev.y) + Math.abs(z - prev.z);

      lastAccelRef.current = { x, y, z };

      const now = Date.now();
      if (delta > SHAKE_THRESHOLD && now - lastShakeRef.current > SHAKE_INTERVAL) {
        lastShakeRef.current = now;
        onShake();
      }
    },
    [onShake],
  );

  // Start listening once permission is granted
  useEffect(() => {
    if (!enabled || permission !== 'granted' || motionListenerRef.current) return;

    window.addEventListener('devicemotion', handleMotion);
    motionListenerRef.current = true;
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      motionListenerRef.current = false;
    };
  }, [enabled, permission, handleMotion]);

  // Call this from a user gesture (button click) on iOS
  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (typeof DeviceMotionEvent === 'undefined') {
      setPermission('unsupported');
      return 'unsupported';
    }
    const DME = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DME.requestPermission !== 'function') {
      // No permission API needed — already available
      setPermission('granted');
      return 'granted';
    }
    try {
      const result = await DME.requestPermission();
      setPermission(result);
      return result;
    } catch {
      setPermission('denied');
      return 'denied';
    }
  }, []);

  return { permission, requestPermission, needsPermission: needsPermission() };
}

export { DIZZY_DURATION };
