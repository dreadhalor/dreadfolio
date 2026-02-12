import { useEffect, useRef, useState } from 'react';

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Make canvas taller to account for parallax scrolling
    const parallaxFactor = 0.15;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const extraHeight = maxScroll * parallaxFactor;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight + extraHeight;

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let x = 0; x < canvas.width; x++) {
          const y =
            canvas.height / 2 +
            Math.sin((x * 0.01 + time + i * 2) * 0.5) * (30 + i * 20) +
            Math.sin((x * 0.02 + time * 1.5 + i) * 0.3) * (20 + i * 10);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        // Stronger waves
        const opacity = 0.15 - i * 0.03;
        ctx.fillStyle = `rgba(148, 163, 184, ${opacity})`;
        ctx.fill();
      }

      time += 0.01;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const parallaxFactor = 0.15;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const extraHeight = maxScroll * parallaxFactor;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight + extraHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 1,
        transform: `translateY(${-scrollY * 0.15}px)`,
      }}
    />
  );
}
