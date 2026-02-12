import { useEffect, useRef } from 'react';

export function NeonGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let scrollY = 0;

    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      const parallaxFactor = 0.3;
      
      canvas.width = window.innerWidth * dpr;
      canvas.height = (window.innerHeight + (maxScroll * parallaxFactor)) * dpr;
      
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight + (maxScroll * parallaxFactor)}px`;
      
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid settings
    const gridSize = 50;
    const horizonY = canvas.height / (window.devicePixelRatio || 1) * 0.35;
    const vanishingPointX = canvas.width / (window.devicePixelRatio || 1) / 2;
    
    let offset = 0;

    const drawGrid = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animated offset
      offset += 0.5;
      if (offset >= gridSize) offset = 0;

      // Draw perspective grid
      ctx.save();
      
      // Gradient fade for depth
      const gradient = ctx.createLinearGradient(0, horizonY, 0, height);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
      gradient.addColorStop(0.3, 'rgba(0, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.05)');

      // Horizontal lines (receding into distance)
      for (let i = 0; i < 50; i++) {
        const y = horizonY + (i * gridSize) - offset;
        if (y > height) break;
        
        // Calculate perspective scale
        const scale = (y - horizonY) / (height - horizonY);
        const lineWidth = 0.5 + scale * 1;
        const opacity = 0.05 + scale * 0.15;
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
        ctx.lineWidth = lineWidth;
        ctx.shadowBlur = 3 + scale * 5;
        ctx.shadowColor = 'rgba(0, 212, 255, 0.2)';
        
        // Draw line from left to right with perspective
        const leftX = vanishingPointX - (vanishingPointX * (1 + scale * 2));
        const rightX = vanishingPointX + (vanishingPointX * (1 + scale * 2));
        
        ctx.moveTo(leftX, y);
        ctx.lineTo(rightX, y);
        ctx.stroke();
      }

      // Vertical lines (converging to vanishing point)
      for (let i = -15; i <= 15; i++) {
        const x = vanishingPointX + (i * gridSize);
        
        ctx.beginPath();
        const opacity = 0.03 + Math.abs(i) * 0.008;
        ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(0, 212, 255, 0.15)';
        
        ctx.moveTo(x, horizonY + gridSize);
        ctx.lineTo(vanishingPointX + (i * gridSize * 3), height);
        ctx.stroke();
      }

      // Subtle accent glow at horizon
      const horizonGradient = ctx.createLinearGradient(0, horizonY - 30, 0, horizonY + 30);
      horizonGradient.addColorStop(0, 'rgba(0, 212, 255, 0)');
      horizonGradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.08)');
      horizonGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
      
      ctx.fillStyle = horizonGradient;
      ctx.fillRect(0, horizonY - 30, width, 60);

      ctx.restore();
      
      animationFrameId = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        transform: `translateY(${-window.scrollY * 0.3}px)`,
        willChange: 'transform',
      }}
    />
  );
}
