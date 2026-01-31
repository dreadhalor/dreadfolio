import { useState, useRef } from 'react';
import { DRAG_SENSITIVITY, CAMERA_MIN_X, CAMERA_MAX_X } from '../config/constants';
import { DragState } from '../types';

export const useCameraControl = () => {
  const [cameraX, setCameraX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<DragState>({ x: 0, startCameraX: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, startCameraX: cameraX };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const newCameraX = dragStartRef.current.startCameraX - deltaX * DRAG_SENSITIVITY;
    setCameraX(Math.max(CAMERA_MIN_X, Math.min(CAMERA_MAX_X, newCameraX)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const moveTo = (x: number) => {
    setCameraX(x);
  };

  return {
    cameraX,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    moveTo,
  };
};
