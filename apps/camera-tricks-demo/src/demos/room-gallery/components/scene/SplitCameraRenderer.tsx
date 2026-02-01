import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_HEIGHT, CAMERA_Z_POSITION, CAMERA_FOV, ROOM_WIDTH, CAMERA_LERP_SPEED } from '../../config/constants';

interface SplitCameraRendererProps {
  targetXRef: React.RefObject<number>;
  onCameraUpdate: (x: number) => void;
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
 * Split Camera Renderer - Four Camera Moving Window (WORKING VERSION)
 * 
 * Four cameras (A, B, C, D) move together, 10 units apart:
 * - All cameras move with currentXRef
 * - Cameras at: currentX, currentX+10, currentX+20, currentX+30
 * - Show two adjacent cameras based on 10-unit segments
 * 
 * Segment to Camera mapping (with wrapping):
 * - Segment 0 (x=0-10):   cameras[0] ↔ cameras[1]
 * - Segment 1 (x=10-20):  cameras[1] ↔ cameras[2]
 * - Segment 2 (x=20-30):  cameras[2] ↔ cameras[3]
 * - Segment 3 (x=30-40):  cameras[3] ↔ cameras[0] (wrapping)
 * - Segment 4 (x=40-50):  cameras[0] ↔ cameras[1] (pattern repeats)
 * - ... continues infinitely
 * 
 * Rooms at x=0, 20, 40, 60... get full single-camera views
 * 
 * Visual effect: Seamless infinite transitions through all rooms
 * 
 * Performance: Scene rendered twice per frame (~2x draw calls)
 */
export function SplitCameraRenderer({ targetXRef, onCameraUpdate }: SplitCameraRendererProps) {
  const { gl, scene, size } = useThree();
  const currentXRef = useRef(0);
  
  // Create FOUR cameras once (memoized)
  const cameras = useMemo(() => {
    try {
      const aspect = (size.width / 2) / size.height;
      const cameraOffset = ROOM_WIDTH / 2; // 10 units apart
      
      // Camera A (index 0)
      const cameraA = new THREE.PerspectiveCamera(
        CAMERA_FOV,
        aspect,
        CAMERA_NEAR_PLANE,
        CAMERA_FAR_PLANE
      );
      cameraA.position.set(0, CAMERA_HEIGHT, CAMERA_Z_POSITION);
      
      // Camera B (index 1) - 10 units ahead
      const cameraB = new THREE.PerspectiveCamera(
        CAMERA_FOV,
        aspect,
        CAMERA_NEAR_PLANE,
        CAMERA_FAR_PLANE
      );
      cameraB.position.set(cameraOffset, CAMERA_HEIGHT, CAMERA_Z_POSITION);
      
      // Camera C (index 2) - 20 units ahead
      const cameraC = new THREE.PerspectiveCamera(
        CAMERA_FOV,
        aspect,
        CAMERA_NEAR_PLANE,
        CAMERA_FAR_PLANE
      );
      cameraC.position.set(cameraOffset * 2, CAMERA_HEIGHT, CAMERA_Z_POSITION);
      
      // Camera D (index 3) - 30 units ahead
      const cameraD = new THREE.PerspectiveCamera(
        CAMERA_FOV,
        aspect,
        CAMERA_NEAR_PLANE,
        CAMERA_FAR_PLANE
      );
      cameraD.position.set(cameraOffset * 3, CAMERA_HEIGHT, CAMERA_Z_POSITION);
      
      return [cameraA, cameraB, cameraC, cameraD];
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
  
  // Animation loop: smooth camera movement with 4-camera system
  useFrame(() => {
    const targetX = targetXRef.current ?? 0;
    const cameraOffset = ROOM_WIDTH / 2; // 10 units between cameras
    
    // Smooth lerp to target position
    currentXRef.current += (targetX - currentXRef.current) * CAMERA_LERP_SPEED;
    
    // Update all four camera positions (maintaining 10-unit spacing)
    cameras[0].position.x = currentXRef.current;                    // Camera A
    cameras[1].position.x = currentXRef.current + cameraOffset;     // Camera B (+10)
    cameras[2].position.x = currentXRef.current + cameraOffset * 2; // Camera C (+20)
    cameras[3].position.x = currentXRef.current + cameraOffset * 3; // Camera D (+30)
    
    // Notify parent of camera position for UI updates
    onCameraUpdate(currentXRef.current);
    
    // Determine which segment we're in (0-based: 0, 1, 2, 3, 4, 5...)
    const segmentIndex = Math.floor(currentXRef.current / 10);
    const segmentStart = segmentIndex * 10;
    
    // Calculate progress within this segment (0 to 1)
    const localProgress = Math.max(0, Math.min(1, (currentXRef.current - segmentStart) / 10));
    
    // Determine which two cameras to show (cycling through 4 cameras)
    // Segment 0: cameras[0] and cameras[1]
    // Segment 1: cameras[1] and cameras[2]
    // Segment 2: cameras[2] and cameras[3]
    // Segment 3: cameras[3] and cameras[0] (wrapping)
    // Segment 4: cameras[0] and cameras[1] (pattern repeats)
    // FIX: Handle negative segmentIndex properly with modulo
    const leftCameraIndex = ((segmentIndex % 4) + 4) % 4;
    const rightCameraIndex = ((segmentIndex + 1) % 4 + 4) % 4;
    
    const leftCamera = cameras[leftCameraIndex];
    const rightCamera = cameras[rightCameraIndex];
    
    // Calculate dynamic viewport widths based on transition progress
    const leftWidth = (1 - localProgress) * size.width;
    const rightWidth = localProgress * size.width;
    
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
