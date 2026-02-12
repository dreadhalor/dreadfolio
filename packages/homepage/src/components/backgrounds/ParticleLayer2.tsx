import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export function ParticleLayer2() {
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

    const parallaxFactor = 0.1;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const extraHeight = maxScroll * parallaxFactor;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight + extraHeight;

    const particles: Particle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;

    // Fewer, slower particles for background layer
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY + scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw dimmer connection lines
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        for (let j = i + 1; j < Math.min(i + 10, particles.length); j++) {
          const other = particles[j];
          
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distSq = dx * dx + dy * dy;
          const connectionDistSq = 100 * 100;

          if (distSq < connectionDistSq) {
            const dist = Math.sqrt(distSq);
            const opacity = 0.3 - (dist / 333);
            ctx.strokeStyle = `rgba(100, 116, 139, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        // Gentle mouse repulsion
        const mouseDx = mouseX - particle.x;
        const mouseDy = mouseY - particle.y;
        const mouseDistSq = mouseDx * mouseDx + mouseDy * mouseDy;
        const repelDistSq = 100 * 100;
        
        if (mouseDistSq < repelDistSq) {
          const mouseDist = Math.sqrt(mouseDistSq);
          const force = (100 - mouseDist) / 100;
          particle.vx -= (mouseDx / mouseDist) * force * 0.3;
          particle.vy -= (mouseDy / mouseDist) * force * 0.3;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Wrap edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw dimmer particles
        ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const parallaxFactor = 0.1;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const extraHeight = maxScroll * parallaxFactor;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight + extraHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 1,
        transform: `translateY(${-scrollY * 0.1}px)`,
      }}
    />
  );
}
