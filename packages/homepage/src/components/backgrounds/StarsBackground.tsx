import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export function StarsBackground() {
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

    const stars: Star[] = [];
    const starCount = 200;

    // Create stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      stars.forEach((star) => {
        // Twinkle effect
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const opacity = star.opacity * twinkle;

        ctx.fillStyle = `rgba(148, 163, 184, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

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
