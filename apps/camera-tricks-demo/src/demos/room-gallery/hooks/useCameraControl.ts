import { useState, useRef, useCallback } from 'react';
import { DRAG_SENSITIVITY, CAMERA_MIN_X, CAMERA_MAX_X } from '../config/constants';
import { DragState } from '../types';

interface UseCameraControlProps {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  invalidate?: () => void;
}

export const useCameraControl = ({ onDragStart, onDragEnd, invalidate }: UseCameraControlProps = {}) => {
  const [cameraX, setCameraX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<DragState>({ x: 0, startCameraX: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, startCameraX: cameraX };
    onDragStart?.();
  }, [cameraX, onDragStart]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const newCameraX = dragStartRef.current.startCameraX - deltaX * DRAG_SENSITIVITY;
    setCameraX(Math.max(CAMERA_MIN_X, Math.min(CAMERA_MAX_X, newCameraX)));
    invalidate?.();
  }, [isDragging, invalidate]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

  const moveTo = useCallback((x: number) => {
    setCameraX(x);
    invalidate?.();
  }, [invalidate]);

  return {
    cameraX,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    moveTo,
  };
};
