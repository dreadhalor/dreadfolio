import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_HEIGHT, CAMERA_Z_POSITION, CAMERA_FOV, CAMERA_SPACING, CAMERA_LERP_SPEED, NUM_ROOMS } from '../../config/constants';
import { calculateCameraPosition } from '../../utils/cameraCalculations';

interface SplitCameraRendererProps {
  targetRoomProgressRef: React.RefObject<number>;
  onRoomProgressUpdate: (progress: number) => void;
  onDebugUpdate?: (info: {
    roomProgress: number;
    currentRoom: number;
    transitionProgress: number;
    leftCameraIdx: number;
    rightCameraIdx: number;
    viewportSplit: { left: number; right: number };
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
 * Split Camera Renderer - 15-Camera System (One Per App)
 * 
 * Fifteen cameras moving together, 10 units apart:
 * - All cameras move with currentX
 * - Camera spacing: currentX, currentX+10, currentX+20, ... currentX+140
 * - Rooms at fixed positions: 0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280
 * 
 * Room to currentX mapping (for 100% viewport):
 * - Each room at index i gets camera i at 100% when currentX = i * 10
 * - Simple, straightforward, no wrapping tricks
 * 
 * Segment logic (10-unit segments for smooth transitions):
 * - Shows two adjacent cameras based on currentX position
 * - Viewport dynamically splits based on progress within segment
 * 
 * Performance: Scene rendered twice per frame (~2x draw calls)
 */
export function SplitCameraRenderer({ targetRoomProgressRef, onRoomProgressUpdate, onDebugUpdate }: SplitCameraRendererProps) {
  const { gl, scene, size } = useThree();
  const currentRoomProgressRef = useRef(0);
  
  // Create cameras once (one per room)
  const cameras = useMemo(() => {
    try {
      const aspect = (size.width / 2) / size.height;
      
      // Create one camera per room
      return Array.from({ length: NUM_ROOMS }, (_, i) => {
        const camera = new THREE.PerspectiveCamera(
          CAMERA_FOV,
          aspect,
          CAMERA_NEAR_PLANE,
          CAMERA_FAR_PLANE
        );
        // Initialize at starting positions (consistent with runtime formula)
        // At roomProgress=0: camera[0]=0, camera[1]=CAMERA_SPACING, camera[2]=CAMERA_SPACING*2, etc.
        const initialX = calculateCameraPosition(i, 0, CAMERA_SPACING);
        camera.position.set(initialX, CAMERA_HEIGHT, CAMERA_Z_POSITION);
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
  
  // Animation loop: smooth room progress updates
  useFrame(() => {
    const targetProgress = targetRoomProgressRef.current ?? 0;
    
    // Smooth lerp to target room progress
    currentRoomProgressRef.current += (targetProgress - currentRoomProgressRef.current) * CAMERA_LERP_SPEED;
    const currentProgress = currentRoomProgressRef.current;
    
    // Notify parent of room progress for UI updates
    onRoomProgressUpdate(currentProgress);
    
    // UPDATE ALL CAMERA POSITIONS based on roomProgress
    // Uses centralized calculation utility for consistency
    // Cameras spaced CAMERA_SPACING apart, offset by roomProgress * CAMERA_SPACING
    for (let i = 0; i < cameras.length; i++) {
      cameras[i].position.x = calculateCameraPosition(i, currentProgress, CAMERA_SPACING);
    }
    
    // DERIVED VALUES from roomProgress:
    
    // Which room are we in? (0-14)
    const currentRoom = Math.floor(currentProgress);
    
    // Transition progress within current room (0.0-1.0)
    const transitionProgress = currentProgress - currentRoom;
    
    // Which two cameras to show (clamp to valid range)
    const leftCameraIndex = Math.max(0, Math.min(NUM_ROOMS - 1, currentRoom));
    const rightCameraIndex = Math.max(0, Math.min(NUM_ROOMS - 1, currentRoom + 1));
    
    const leftCamera = cameras[leftCameraIndex];
    const rightCamera = cameras[rightCameraIndex];
    
    // Calculate dynamic viewport widths based on transition progress
    const leftWidth = (1 - transitionProgress) * size.width;
    const rightWidth = transitionProgress * size.width;
    
    // Send debug info to parent
    if (onDebugUpdate) {
      onDebugUpdate({
        roomProgress: currentProgress,
        currentRoom,
        transitionProgress,
        leftCameraIdx: leftCameraIndex,
        rightCameraIdx: rightCameraIndex,
        viewportSplit: { 
          left: leftWidth / size.width, 
          right: rightWidth / size.width 
        },
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
