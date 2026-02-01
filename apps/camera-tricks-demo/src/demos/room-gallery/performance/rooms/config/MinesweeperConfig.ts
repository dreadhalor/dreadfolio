/**
 * Minesweeper Room Configuration
 * 
 * 90s computer room / retro gaming den configuration.
 */

export const MINESWEEPER_CONFIG = {
  // Computer desk
  DESK: {
    width: 3,
    height: 0.2,
    depth: 1.8,
    y: 1,
    z: -6,
    legWidth: 0.15,
    legHeight: 1,
    legDepth: 0.15,
    legOffsetX: 1.3,
    legOffsetZ: 0.8,
  },
  
  // CRT Monitor (bulky, deep)
  MONITOR: {
    screenWidth: 1.2,
    screenHeight: 0.9,
    screenDepth: 0.8,
    standRadius: 0.2,
    standRadiusBottom: 0.25,
    standHeight: 0.3,
    standSegments: 8,
    x: 0,
    screenY: 1.6,
    standY: 1.25,
    z: -6,
  },
  
  // PC Tower (beige 90s style)
  TOWER: {
    width: 0.5,
    height: 1.2,
    depth: 0.8,
    driveSlotCount: 3,
    driveSlotWidth: 0.4,
    driveSlotHeight: 0.05,
    driveSlotDepth: 0.05,
    x: -2,
    y: 1.7,
    z: -6,
    driveStartY: 1.8,
    driveSpacing: 0.2,
    driveZ: -5.6,
  },
  
  // Keyboard
  KEYBOARD: {
    width: 1.2,
    height: 0.05,
    depth: 0.4,
    x: 0.2,
    y: 1.15,
    z: -5,
  },
  
  // Mouse
  MOUSE: {
    width: 0.12,
    height: 0.06,
    depth: 0.18,
    x: 1.2,
    y: 1.15,
    z: -5,
  },
  
  // Mouse pad
  MOUSE_PAD: {
    width: 0.8,
    height: 0.02,
    depth: 0.6,
    x: 1.2,
    y: 1.13,
    z: -5,
  },
  
  // Floppy disks (scattered)
  FLOPPY_DISKS: {
    count: 5,
    width: 0.25,
    height: 0.01,
    depth: 0.25,
    startX: -1,
    spacing: 0.4,
    baseY: 1.12,
    z: -6.5,
  },
  
  // CDs (stack)
  CD_STACK: {
    count: 10,
    radius: 0.15,
    height: 0.01,
    segments: 32,
    x: 0.5,
    baseY: 1.12,
    ySpacing: 0.02,
    z: -5.5,
  },
  
  // Windows XP box
  XP_BOX: {
    width: 0.8,
    height: 1,
    depth: 0.6,
    x: 3,
    y: 0.5,
    z: 5,
  },
  
  // Speakers
  SPEAKERS: {
    count: 2,
    width: 0.3,
    height: 0.4,
    depth: 0.3,
    coneRadius: 0.08,
    coneHeight: 0.02,
    coneSegments: 16,
    leftX: -1.3,
    rightX: 1.3,
    y: 1.3,
    z: -6.5,
    coneZ: -6.35,
  },
  
  // Retro posters
  POSTERS: {
    count: 4,
    width: 1,
    height: 1.3,
    depth: 0.05,
    startX: -7,
    spacing: 4.5,
    y: 2.5,
    z: -9.8,
  },
  
  // Floppy disk holder
  DISK_HOLDER: {
    width: 0.3,
    height: 0.3,
    depth: 0.15,
    diskCount: 8,
    diskWidth: 0.02,
    diskHeight: 0.25,
    diskDepth: 0.25,
    diskSpacing: 0.025,
    x: 1.3,
    y: 1.25,
    z: -6.5,
  },
  
  // CD jewel cases
  JEWEL_CASES: {
    count: 10,
    width: 0.3,
    height: 0.02,
    depth: 0.3,
    stackSpacing: 0.025,
    x: -1.3,
    baseY: 1.12,
    z: -6.5,
  },
  
  // Desktop icons
  DESKTOP_ICONS: {
    count: 8,
    size: 0.1,
    depth: 0.02,
    cols: 2,
    colSpacing: 0.15,
    rowSpacing: 0.12,
    startX: -0.4,
    startY: 1.6,
    z: -5.59,
  },
  
  // Taskbar
  TASKBAR: {
    width: 1,
    height: 0.05,
    depth: 0.02,
    x: 0,
    y: 1.2,
    z: -5.59,
  },
  
  // Wood paneling
  WOOD_PANELS: {
    count: 6,
    width: 3,
    height: 0.8,
    depth: 0.08,
    startX: -7.5,
    spacing: 3,
    baseY: 1,
    alternateOffset: 0.2,
    z: 9.8,
  },
  
  // Power strip
  POWER_STRIP: {
    width: 0.8,
    height: 0.08,
    depth: 0.15,
    outletCount: 6,
    outletWidth: 0.08,
    outletHeight: 0.05,
    outletDepth: 0.02,
    outletSpacing: 0.14,
    x: 0,
    y: 0.15,
    z: -6.5,
    outletStartX: -0.35,
    outletZ: -6.43,
  },
  
  // Number blocks (instanced)
  NUMBER_BLOCKS: {
    count: 9,
    color: '#c0c0c0',
  },
  
  // Rug
  RUG: {
    width: 10,
    depth: 8,
    y: 0.01,
  },
} as const;
