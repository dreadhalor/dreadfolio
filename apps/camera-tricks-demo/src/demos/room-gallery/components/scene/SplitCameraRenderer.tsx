import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_HEIGHT, CAMERA_Z_POSITION, CAMERA_FOV, ROOM_WIDTH, CAMERA_LERP_SPEED } from '../../config/constants';

interface SplitCameraRendererProps {
  targetXRef: React.RefObject<number>;
  onCameraUpdate: (x: number) => void;
  onDebugUpdate?: (info: {
    cameraPositions: number[];
    viewportSplit: { left: number; right: number };
    leftCameraIdx: number;
    rightCameraIdx: number;
    currentX: number;
    targetX: number;
    segmentIndex: number;
    localProgress: number;
  }) => void;
}

// Camera projection constants
const CAMERA_NEAR_PLANE = 0.1;
const CAMERA_FAR_PLANE = 1000;

/**
 * Helper: Configure view offset for dynamic split-screen rendering
 * @param camera - Camera to configure
 * @param screenWidth - Full screen width
 * @param screenHeight - Full screen height
 * @param viewportWidth - Width of this camera's viewport
 * @param xOffset - Horizontal offset for view offset
 */
function setViewOffsetForDynamicSplit(
  camera: THREE.PerspectiveCamera,
  screenWidth: number,
  screenHeight: number,
  viewportWidth: number,
  xOffset: number
) {
  camera.setViewOffset(
    screenWidth,          // full width
    screenHeight,         // full height
    xOffset,              // x offset
    0,                    // y offset
    viewportWidth,        // viewport width (dynamic)
    screenHeight          // viewport height
  );
}

/**
 * Split Camera Renderer - 6-Camera Moving Window
 * 
 * Six cameras moving together, 10 units apart:
 * - All cameras move with currentX
 * - Camera spacing: currentX, currentX+10, currentX+20, currentX+30, currentX+40, currentX+50
 * - Rooms at fixed positions: 0, 20, 40, 60, 80, 100
 * 
 * Room to currentX mapping (for 100% viewport):
 * - Library (x=0): currentX=0, Camera 0 at x=0
 * - Gallery (x=20): currentX=10, Camera 1 at x=20
 * - Greenhouse (x=40): currentX=20, Camera 2 at x=40
 * - Lounge (x=60): currentX=30, Camera 3 at x=60
 * - Office (x=80): currentX=40, Camera 4 at x=80
 * - Observatory (x=100): currentX=50, Camera 5 at x=100
 * 
 * Segment logic (10-unit segments for smooth transitions):
 * - Shows two adjacent cameras based on currentX position
 * - Viewport dynamically splits based on progress within segment
 * 
 * Performance: Scene rendered twice per frame (~2x draw calls)
 */
export function SplitCameraRenderer({ targetXRef, onCameraUpdate, onDebugUpdate }: SplitCameraRendererProps) {
  const { gl, scene, size } = useThree();
  const currentXRef = useRef(0);
  
  // Create SIX cameras once (memoized) - one for each room
  const cameras = useMemo(() => {
    try {
      const aspect = (size.width / 2) / size.height;
      
      // Create 6 cameras with 10-unit spacing (will be updated in useFrame)
      return Array.from({ length: 6 }, (_, i) => {
        const camera = new THREE.PerspectiveCamera(
          CAMERA_FOV,
          aspect,
          CAMERA_NEAR_PLANE,
          CAMERA_FAR_PLANE
        );
        // Initialize at correct spacing (10 units apart)
        camera.position.set(i * (ROOM_WIDTH / 2), CAMERA_HEIGHT, CAMERA_Z_POSITION);
        return camera;
      });
    } catch (error) {
      console.error('Failed to create cameras:', error);
      throw error; // Re-throw to trigger error boundary
    }
  }, []); // Create once on mount
  
  // Note: Aspect ratio and view offsets are now calculated per-frame
  // since they depend on the dynamic split ratio
  
  // Cleanup cameras on unmount
  useEffect(() => {
    return () => {
      // Dispose of all cameras to prevent memory leaks
      cameras.forEach(cam => cam.clear());
    };
  }, [cameras]);
  
  // Animation loop: smooth camera movement with 6-camera system
  useFrame(() => {
    const targetX = targetXRef.current ?? 0;
    const cameraOffset = ROOM_WIDTH / 2; // 10 units between cameras for parallax
    
    // Smooth lerp to target position
    currentXRef.current += (targetX - currentXRef.current) * CAMERA_LERP_SPEED;
    
    // UPDATE ALL CAMERA POSITIONS - THEY MOVE WITH CURRENTX!
    // Camera spacing: 10 units apart (ROOM_WIDTH / 2) for smooth parallax between 20-unit rooms
    cameras[0].position.x = currentXRef.current;                    // Camera 0
    cameras[1].position.x = currentXRef.current + cameraOffset;     // Camera 1 (+10)
    cameras[2].position.x = currentXRef.current + cameraOffset * 2; // Camera 2 (+20)
    cameras[3].position.x = currentXRef.current + cameraOffset * 3; // Camera 3 (+30)
    cameras[4].position.x = currentXRef.current + cameraOffset * 4; // Camera 4 (+40)
    cameras[5].position.x = currentXRef.current + cameraOffset * 5; // Camera 5 (+50)
    
    // Notify parent of camera position for UI updates
    onCameraUpdate(currentXRef.current);
    
    // Determine which segment we're in (10-unit segments for smooth transitions)
    const segmentIndex = Math.floor(currentXRef.current / cameraOffset);
    const segmentStart = segmentIndex * cameraOffset;
    
    // Calculate progress within this segment (0 to 1)
    const localProgress = Math.max(0, Math.min(1, (currentXRef.current - segmentStart) / cameraOffset));
    
    // Determine which two cameras to show (with wrapping for infinite coverage)
    // Segment 0 (x=0-10): cameras[0] ↔ cameras[1]
    // Segment 1 (x=10-20): cameras[1] ↔ cameras[2]
    // ...
    // Segment 5 (x=50-60): cameras[5] ↔ cameras[0] (wraps)
    // Segment 6 (x=60-70): cameras[0] ↔ cameras[1] (pattern repeats)
    const leftCameraIndex = ((segmentIndex % 6) + 6) % 6;
    const rightCameraIndex = ((segmentIndex + 1) % 6 + 6) % 6;
    
    const leftCamera = cameras[leftCameraIndex];
    const rightCamera = cameras[rightCameraIndex];
    
    // Calculate dynamic viewport widths based on transition progress
    const leftWidth = (1 - localProgress) * size.width;
    const rightWidth = localProgress * size.width;
    
    // Send debug info to parent
    if (onDebugUpdate) {
      onDebugUpdate({
        cameraPositions: cameras.map(c => c.position.x),
        viewportSplit: { 
          left: (1 - localProgress) * 100, 
          right: localProgress * 100 
        },
        leftCameraIdx: leftCameraIndex,
        rightCameraIdx: rightCameraIndex,
        currentX: currentXRef.current,
        targetX,
        segmentIndex,
        localProgress,
      });
    }
    
    // Update camera aspects based on dynamic widths
    leftCamera.aspect = leftWidth / size.height;
    rightCamera.aspect = rightWidth / size.height;
    leftCamera.updateProjectionMatrix();
    rightCamera.updateProjectionMatrix();
    
    // Update view offsets for dynamic split
    setViewOffsetForDynamicSplit(leftCamera, size.width, size.height, leftWidth, 0);
    setViewOffsetForDynamicSplit(rightCamera, size.width, size.height, rightWidth, size.width - rightWidth);
    
    // Clear and prepare for split rendering
    gl.setScissorTest(true);
    gl.autoClear = false;
    gl.clear();
    
    // Render left viewport
    gl.setViewport(0, 0, leftWidth, size.height);
    gl.setScissor(0, 0, leftWidth, size.height);
    gl.render(scene, leftCamera);
    
    // Render right viewport
    gl.setViewport(leftWidth, 0, rightWidth, size.height);
    gl.setScissor(leftWidth, 0, rightWidth, size.height);
    gl.render(scene, rightCamera);
    
    // Reset scissor test
    gl.setScissorTest(false);
  }, 1); // Priority 1 to run after scene updates
  
  return null; // This component only manages rendering, no visual elements
}
