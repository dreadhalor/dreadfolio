import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { FPS_SAMPLE_SIZE, FPS_COUNTER_UPDATE_FREQUENCY } from '../../config/constants';
import { FPSCounterProps } from '../../types/props';

/**
 * FPS Counter Component
 * Tracks frame rate with minimal overhead
 * 
 * Performance optimizations:
 * - Only updates every N frames (configurable)
 * - Uses ref for state to avoid React re-renders
 * - Maintains sliding window of samples
 */
export function FPSCounter({ onFpsUpdate }: FPSCounterProps) {
  const frameTimesRef = useRef<number[]>([]);
  const frameCountRef = useRef(0);
  
  useFrame(() => {
    frameCountRef.current++;
    
    // Only update every N frames to reduce overhead
    if (frameCountRef.current % FPS_COUNTER_UPDATE_FREQUENCY !== 0) return;
    
    const now = performance.now();
    frameTimesRef.current.push(now);
    
    // Keep only last N samples
    if (frameTimesRef.current.length > FPS_SAMPLE_SIZE) {
      frameTimesRef.current.shift();
    }
    
    // Calculate FPS from samples
    if (frameTimesRef.current.length >= 10) {
      const times = frameTimesRef.current;
      const elapsed = times[times.length - 1] - times[0];
      const currentFps = Math.round((times.length / elapsed) * 1000);
      onFpsUpdate(currentFps);
    }
  });
  
  return null;
}
