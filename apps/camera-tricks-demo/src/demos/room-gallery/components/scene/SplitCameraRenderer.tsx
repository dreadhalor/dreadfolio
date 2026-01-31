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
 * Helper: Configure view offset for split-screen rendering
 * @param camera - Camera to configure
 * @param screenWidth - Full screen width
 * @param screenHeight - Full screen height
 * @param xOffset - Horizontal offset (0 for left, screenWidth/2 for right)
 */
function setViewOffsetForSplitScreen(
  camera: THREE.PerspectiveCamera,
  screenWidth: number,
  screenHeight: number,
  xOffset: number
) {
  camera.setViewOffset(
    screenWidth,          // full width
    screenHeight,         // full height
    xOffset,              // x offset
    0,                    // y offset
    screenWidth / 2,      // viewport width (half screen)
    screenHeight          // viewport height
  );
}

/**
 * Split Camera Renderer
 * 
 * Renders two adjacent rooms simultaneously using split-screen technique:
 * - Left half of screen: Shows left 50% of left camera's view
 * - Right half of screen: Shows right 50% of right camera's view
 * 
 * Technical approach:
 * 1. Create two cameras positioned one ROOM_WIDTH apart
 * 2. Use setViewport() and setScissor() to render to specific screen regions
 * 3. Adjust camera view offset to show left/right halves respectively
 * 
 * Visual effect: Seamless split view of two adjacent rooms
 * 
 * Performance: Scene rendered twice per frame (~2x draw calls)
 */
export function SplitCameraRenderer({ targetXRef, onCameraUpdate }: SplitCameraRendererProps) {
  const { gl, scene, size } = useThree();
  const currentXRef = useRef(0);
  
  // Create cameras once (memoized)
  const cameras = useMemo(() => {
    try {
      const aspect = (size.width / 2) / size.height; // Each camera renders to half width
      
      // Left camera
      const left = new THREE.PerspectiveCamera(
        CAMERA_FOV,
        aspect,
        CAMERA_NEAR_PLANE,
        CAMERA_FAR_PLANE
      );
      left.position.set(0, CAMERA_HEIGHT, CAMERA_Z_POSITION);
      
      // Right camera (positioned one room width to the right)
      const right = new THREE.PerspectiveCamera(
        CAMERA_FOV,
        aspect,
        CAMERA_NEAR_PLANE,
        CAMERA_FAR_PLANE
      );
      right.position.set(ROOM_WIDTH, CAMERA_HEIGHT, CAMERA_Z_POSITION);
      
      return { left, right };
    } catch (error) {
      console.error('Failed to create split cameras:', error);
      throw error; // Re-throw to trigger error boundary
    }
  }, []); // Create once on mount
  
  // Initialize and update view offsets on size change
  useEffect(() => {
    const { left, right } = cameras;
    const aspect = (size.width / 2) / size.height;
    
    // Update aspect ratio
    left.aspect = aspect;
    right.aspect = aspect;
    
    // Update projection matrices
    left.updateProjectionMatrix();
    right.updateProjectionMatrix();
    
    // Set up view offsets for split-screen
    setViewOffsetForSplitScreen(left, size.width, size.height, 0); // Left half
    setViewOffsetForSplitScreen(right, size.width, size.height, size.width / 2); // Right half
  }, [size.width, size.height, cameras]);
  
  // Cleanup cameras on unmount
  useEffect(() => {
    return () => {
      // Dispose of cameras to prevent memory leaks
      cameras.left.clear();
      cameras.right.clear();
    };
  }, [cameras]);
  
  // Animation loop: smooth camera movement and split rendering
  useFrame(() => {
    const { left, right } = cameras;
    const targetX = targetXRef.current ?? 0;
    
    // Smooth lerp to target position
    currentXRef.current += (targetX - currentXRef.current) * CAMERA_LERP_SPEED;
    
    // Update camera positions (maintaining ROOM_WIDTH distance)
    left.position.x = currentXRef.current;
    right.position.x = currentXRef.current + ROOM_WIDTH;
    
    // Notify parent of camera position for UI updates
    onCameraUpdate(currentXRef.current);
    
    // Clear and prepare for split rendering
    gl.setScissorTest(true);
    gl.autoClear = false;
    gl.clear();
    
    // Render left half (left camera to left viewport)
    const halfWidth = size.width / 2;
    gl.setViewport(0, 0, halfWidth, size.height);
    gl.setScissor(0, 0, halfWidth, size.height);
    gl.render(scene, left);
    
    // Render right half (right camera to right viewport)
    gl.setViewport(halfWidth, 0, halfWidth, size.height);
    gl.setScissor(halfWidth, 0, halfWidth, size.height);
    gl.render(scene, right);
    
    // Reset scissor test
    gl.setScissorTest(false);
  }, 1); // Priority 1 to run after scene updates
  
  return null; // This component only manages rendering, no visual elements
}
