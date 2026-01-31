import { useFrame, useThree } from '@react-three/fiber';
import { DrawCallMonitorProps, DrawCallDisplayProps } from '../types/props';
import { DRAW_CALL_EXCELLENT_THRESHOLD, DRAW_CALL_GOOD_THRESHOLD } from '../config/performance';

/**
 * Draw Call Monitor
 * Tracks Three.js render calls in real-time
 * 
 * Draw calls are the primary performance bottleneck in 3D rendering.
 * Target: < 50 for 60 FPS on most hardware
 */
export function DrawCallMonitor({ onUpdate }: DrawCallMonitorProps) {
  const gl = useThree((state) => state.gl);
  
  useFrame(() => {
    const renderCalls = gl.info.render.calls;
    onUpdate(renderCalls);
  });
  
  return null;
}

/**
 * Draw Call Display UI
 * Shows real-time draw call count with color-coded status
 */
export function DrawCallDisplay({ calls }: DrawCallDisplayProps) {
  const isExcellent = calls < DRAW_CALL_EXCELLENT_THRESHOLD;
  const isGood = calls >= DRAW_CALL_EXCELLENT_THRESHOLD && calls < DRAW_CALL_GOOD_THRESHOLD;
  const color = isExcellent ? '#0f0' : isGood ? '#ff0' : '#f00';
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '5rem',
        right: '1rem',
        color,
        fontSize: '0.9rem',
        fontWeight: 'bold',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '0.5rem 1rem',
        borderRadius: '0.25rem',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        border: `2px solid ${color}`,
      }}
    >
      <div>Draw Calls: {calls}</div>
      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
        {isExcellent ? '✅ Excellent' : isGood ? '⚠️ Good' : '❌ Too Many'}
      </div>
      <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>
        Target: &lt;{DRAW_CALL_EXCELLENT_THRESHOLD}
      </div>
    </div>
  );
}
