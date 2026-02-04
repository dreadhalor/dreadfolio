/**
 * Split Viewport Renderer Hook
 * 
 * Handles manual rendering of split-screen viewports with dynamic transitions.
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import {
  calculateViewportWidths,
  renderViewport,
} from '../utils/viewportRenderer';
import { NUM_ROOMS } from '../config/constants';
import { RENDER_PRIORITY } from '../config/portalAnimationConstants';
import type { ExtendedCamera, ViewportConfig } from '../types/portalTypes';

interface UseSplitViewportRendererProps {
  cameras: ExtendedCamera[];
  currentRoomProgress: number;
  appLoaderState: string;
  onDebugUpdate?: (info: {
    roomProgress: number;
    currentRoom: number;
    transitionProgress: number;
    leftCameraIdx: number;
    rightCameraIdx: number;
    viewportSplit: { left: number; right: number };
  }) => void;
}

/**
 * Manages split-screen rendering with dynamic viewport transitions
 * 
 * Features:
 * - Calculates which two cameras to show based on room progress
 * - Computes dynamic viewport widths for smooth transitions
 * - Handles WebGL context loss gracefully
 * - Sets proper scissor test and clear colors
 * - Prevents black screen at room edges (zero-width viewport guard)
 * - Optional debug info callback
 * 
 * Performance: Manual rendering with scissor test for precise control
 */
export function useSplitViewportRenderer({
  cameras,
  currentRoomProgress,
  appLoaderState,
  onDebugUpdate,
}: UseSplitViewportRendererProps): void {
  const { gl, scene, size, set } = useThree();
  const contextLostRef = useRef(false);

  // WebGL context loss detection (efficient event-based approach)
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLostRef.current = true;
      console.error('WebGL context lost');
    };

    const handleContextRestored = () => {
      contextLostRef.current = false;
      console.log('WebGL context restored');
    };

    gl.domElement.addEventListener('webglcontextlost', handleContextLost);
    gl.domElement.addEventListener(
      'webglcontextrestored',
      handleContextRestored,
    );

    return () => {
      gl.domElement.removeEventListener('webglcontextlost', handleContextLost);
      gl.domElement.removeEventListener(
        'webglcontextrestored',
        handleContextRestored,
      );
    };
  }, [gl]);

  useFrame(() => {
    // Guard: Don't render if context is lost
    if (contextLostRef.current) return;

    // Calculate which cameras to show
    const currentRoom = Math.floor(currentRoomProgress);
    const transitionProgress = currentRoomProgress - currentRoom;

    const leftCameraIndex = Math.max(0, Math.min(NUM_ROOMS - 1, currentRoom));
    const rightCameraIndex = Math.max(
      0,
      Math.min(NUM_ROOMS - 1, currentRoom + 1),
    );

    const leftCamera = cameras[leftCameraIndex];
    const rightCamera = cameras[rightCameraIndex];

    // Update R3F's active camera for other systems (e.g., raycasting, effects)
    set({ camera: leftCamera });

    // Calculate dynamic viewport widths based on transition progress
    const { leftWidth, rightWidth } = calculateViewportWidths(
      transitionProgress,
      size.width,
    );

    // Send debug info to parent
    if (onDebugUpdate) {
      onDebugUpdate({
        roomProgress: currentRoomProgress,
        currentRoom,
        transitionProgress,
        leftCameraIdx: leftCameraIndex,
        rightCameraIdx: rightCameraIndex,
        viewportSplit: {
          left: leftWidth / size.width,
          right: rightWidth / size.width,
        },
      });
    }

    // Setup rendering state
    gl.setScissorTest(true);
    gl.autoClear = false;

    // Transparent clear when minimizing to see iframe behind portal
    if (appLoaderState === 'minimizing') {
      gl.setClearColor(0x000000, 0); // Transparent
    } else {
      gl.setClearColor(0x000000, 1); // Black background to match fog
    }
    gl.clear();

    // Render left viewport (always has width)
    if (leftWidth > 0) {
      const leftViewport: ViewportConfig = {
        x: 0,
        y: 0,
        width: leftWidth,
        height: size.height,
        xOffset: 0,
      };

      renderViewport(gl, scene, leftCamera, leftViewport, size);
    }

    // Render right viewport (only has width during transitions and at rightmost room)
    if (rightWidth > 0) {
      const rightViewport: ViewportConfig = {
        x: leftWidth,
        y: 0,
        width: rightWidth,
        height: size.height,
        xOffset: size.width - rightWidth,
      };

      renderViewport(gl, scene, rightCamera, rightViewport, size);
    }

    // Reset scissor test
    gl.setScissorTest(false);
  }, RENDER_PRIORITY);
}
