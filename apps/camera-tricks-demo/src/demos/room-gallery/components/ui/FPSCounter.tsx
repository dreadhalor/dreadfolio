import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { FPS_SAMPLE_SIZE, FPS_UPDATE_INTERVAL } from '../../config/constants';

interface FPSCounterProps {
  onFpsUpdate: (fps: number) => void;
}

export function FPSCounter({ onFpsUpdate }: FPSCounterProps) {
  const frameTimesRef = useRef<number[]>([]);
  
  useFrame(() => {
    const now = performance.now();
    frameTimesRef.current.push(now);
    
    // Keep only last N frames
    if (frameTimesRef.current.length > FPS_SAMPLE_SIZE) {
      frameTimesRef.current.shift();
    }
    
    // Calculate FPS every N frames
    if (frameTimesRef.current.length >= 10 && frameTimesRef.current.length % FPS_UPDATE_INTERVAL === 0) {
      const times = frameTimesRef.current;
      const elapsed = times[times.length - 1] - times[0];
      const currentFps = Math.round((times.length / elapsed) * 1000);
      onFpsUpdate(currentFps);
    }
  });
  
  return null;
}
