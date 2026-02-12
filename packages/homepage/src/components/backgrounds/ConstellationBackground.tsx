import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseX: number;
  baseY: number;
}

export function ConstellationBackground() {
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

    const particles: Particle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let time = 0;

    // Create ambient particles
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 1,
        baseX: x,
        baseY: y,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY + scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005;

      // Draw connection lines first
      const connectionDistance = 120;
      const connectionDistSq = connectionDistance * connectionDistance;
      
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        for (let j = i + 1; j < Math.min(i + 15, particles.length); j++) {
          const other = particles[j];
          
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDistSq) {
            const dist = Math.sqrt(distSq);
            const opacity = 0.5 - (dist / 240);
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Mouse repulsion
        const mouseDx = mouseX - particle.x;
        const mouseDy = mouseY - particle.y;
        const mouseDistSq = mouseDx * mouseDx + mouseDy * mouseDy;
        const repelDist = 150;
        
        if (mouseDistSq < repelDist * repelDist) {
          const mouseDist = Math.sqrt(mouseDistSq);
          const force = (repelDist - mouseDist) / repelDist;
          particle.vx -= (mouseDx / mouseDist) * force * 0.8;
          particle.vy -= (mouseDy / mouseDist) * force * 0.8;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Damping
        particle.vx *= 0.95;
        particle.vy *= 0.95;

        // Wrap edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle - brighter
        ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.2, 0, Math.PI * 2);
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
        transform: `translateY(${-scrollY * 0.15}px)`,
      }}
    />
  );
}
