interface FPSDisplayProps {
  fps: number;
}

export function FPSDisplay({ fps }: FPSDisplayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 'bold',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '0.5rem 1rem',
        borderRadius: '0.25rem',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      }}
    >
      {fps} FPS
    </div>
  );
}
