import { RoomColors, RoomData } from './index';

/**
 * Component prop type definitions
 * Centralized type safety for all components
 */

// Scene component props
export interface SceneProps {
  targetXRef: React.MutableRefObject<number>;
  cameraX: number;
  onFpsUpdate: (fps: number) => void;
  onDrawCallsUpdate: (calls: number) => void;
}

// Camera controller props
export interface CameraControllerProps {
  targetXRef: React.MutableRefObject<number>;
}

// Room structure props
export interface RoomStructureProps {
  offsetX: number;
  colors: RoomColors;
  isFirst: boolean;
  isLast: boolean;
}

// Dividing wall props
export interface DividingWallProps {
  position: [number, number, number];
  leftRoomColor: string;
  rightRoomColor: string;
}

// Room decoration props
export interface RoomDecorationProps {
  colors: RoomColors;
  offsetX: number;
}

// FPS counter props
export interface FPSCounterProps {
  onFpsUpdate: (fps: number) => void;
}

// Draw call monitor props
export interface DrawCallMonitorProps {
  onUpdate: (calls: number) => void;
}

// UI component props
export interface FPSDisplayProps {
  fps: number;
}

export interface DrawCallDisplayProps {
  calls: number;
}

export interface RoomHeaderProps {
  currentRoom: RoomData;
}

export interface RoomMinimapProps {
  rooms: RoomData[];
  currentRoom: RoomData;
  onRoomClick: (x: number) => void;
}
