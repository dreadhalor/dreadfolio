import { createContext, useContext, MutableRefObject } from 'react';
import { RoomData } from '../../types';

interface FloatingMenuBarContextValue {
  isCollapsed: boolean;
  shouldHideButtons: boolean;
  hoveredButton: string | null;
  setHoveredButton: (button: string | null) => void;
  touchStartRef: MutableRefObject<{ x: number; y: number } | null>;
  handleButtonTouchStart: (e: React.TouchEvent) => void;
  isTouchClick: (e: React.TouchEvent) => boolean;
  // Cards container props
  rooms: RoomData[];
  currentRoom: RoomData;
  smoothRoomProgress: number;
  cardRefsRef: MutableRefObject<(HTMLDivElement | null)[]>;
  cardHeight: number;
  miniCardSize: number;
  cardWidth: number;
  isMobile: boolean;
  onRoomClick: (room: RoomData) => void;
  onLoadApp: (url: string, name: string, roomIndex: number) => void;
}

const FloatingMenuBarContext = createContext<FloatingMenuBarContextValue | null>(null);

export function useFloatingMenuBarContext() {
  const context = useContext(FloatingMenuBarContext);
  if (!context) {
    throw new Error('useFloatingMenuBarContext must be used within FloatingMenuBarProvider');
  }
  return context;
}

export const FloatingMenuBarProvider = FloatingMenuBarContext.Provider;
