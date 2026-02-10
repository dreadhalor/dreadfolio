import { MutableRefObject } from 'react';

interface CameraDebugDisplayProps {
  currentRoomProgressRef: MutableRefObject<number>;
  targetRoomProgressRef: MutableRefObject<number>;
  roomProgress: number;
  currentRoomIndex: number;
  appLoaderState: string;
  activePortalRef: MutableRefObject<number | null>;
}

export function CameraDebugDisplay({
  currentRoomProgressRef,
  targetRoomProgressRef,
  roomProgress,
  currentRoomIndex,
  appLoaderState,
  activePortalRef,
}: CameraDebugDisplayProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#0f0',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '4px',
        zIndex: 10000,
        minWidth: '250px',
        border: '1px solid rgba(0, 255, 0, 0.3)',
      }}
    >
      <div style={{ marginBottom: '8px', color: '#fff', fontWeight: 'bold' }}>
        🎥 Camera Debug
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div>
          <span style={{ color: '#888' }}>Current Ref:</span>{' '}
          <span style={{ color: '#0ff' }}>
            {currentRoomProgressRef.current.toFixed(3)}
          </span>
        </div>
        <div>
          <span style={{ color: '#888' }}>Target Ref:</span>{' '}
          <span style={{ color: '#0ff' }}>
            {targetRoomProgressRef.current.toFixed(3)}
          </span>
        </div>
        <div>
          <span style={{ color: '#888' }}>Room Progress:</span>{' '}
          <span style={{ color: '#ff0' }}>{roomProgress.toFixed(3)}</span>
        </div>
        <div>
          <span style={{ color: '#888' }}>Current Room:</span>{' '}
          <span style={{ color: '#f0f' }}>{currentRoomIndex}</span>
        </div>
        <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #333' }}>
          <span style={{ color: '#888' }}>App State:</span>{' '}
          <span style={{ color: '#fa0' }}>{appLoaderState}</span>
        </div>
        <div>
          <span style={{ color: '#888' }}>Active Portal:</span>{' '}
          <span style={{ color: '#0f0' }}>
            {activePortalRef.current !== null ? activePortalRef.current : 'null'}
          </span>
        </div>
      </div>
    </div>
  );
}
