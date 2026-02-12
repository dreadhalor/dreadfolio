import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  targetX: number;
  targetY: number;
  baseX: number;
  baseY: number;
  formingShape: boolean;
}

export function ParticleBackground() {
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
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

    // Create text particles for "SCOTT HETRICK" - OPTIMIZED
    const createTextParticles = () => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (!tempCtx) return [];

      const text = 'SCOTT HETRICK';
      const fontSize = Math.min(canvas.width * 0.08, 80);
      
      // Set canvas size first
      tempCanvas.width = canvas.width;
      tempCanvas.height = fontSize * 2;
      
      // Configure text rendering
      tempCtx.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
      tempCtx.fillStyle = 'white';
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      
      // Draw text centered
      tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const textParticles: { x: number; y: number }[] = [];

      // Much larger step for better performance - fewer particles
      const step = 8;
      for (let y = 0; y < tempCanvas.height; y += step) {
        for (let x = 0; x < tempCanvas.width; x += step) {
          const i = (y * tempCanvas.width + x) * 4;
          const alpha = imageData.data[i + 3];
          if (alpha > 128) {
            // Position relative to final canvas
            const centerY = canvas.height * 0.25;
            textParticles.push({
              x: x,
              y: centerY + y - tempCanvas.height / 2,
            });
          }
        }
      }

      return textParticles;
    };

    const textParticles = createTextParticles();
    console.log(`Created ${textParticles.length} text particles`);
    
    // Create particles - text particles + some ambient ones
    const ambientCount = 30;
    const totalParticles = textParticles.length + ambientCount;
    
    for (let i = 0; i < totalParticles; i++) {
      const isTextParticle = i < textParticles.length;
      let baseX, baseY;
      
      if (isTextParticle) {
        baseX = textParticles[i].x;
        baseY = textParticles[i].y;
      } else {
        // Ambient particles spread around the screen
        baseX = Math.random() * canvas.width;
        baseY = Math.random() * canvas.height;
      }
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 1.5 + 1,
        targetX: baseX,
        targetY: baseY,
        baseX,
        baseY,
        formingShape: isTextParticle,
      });
    }
    
    console.log(`Total particles: ${particles.length} (${textParticles.length} text, ${ambientCount} ambient)`);

    // Cache shapes to avoid recreating every frame
    const shapeCache: { [key: number]: { x: number; y: number }[] } = {};
    
    const getShapes = (shapeIndex: number) => {
      if (shapeCache[shapeIndex]) return shapeCache[shapeIndex];
      
      const shapes: { x: number; y: number }[] = [];
      
      if (shapeIndex === 0) {
        // Circle - fewer points
        const centerX = canvas.width * 0.75;
        const centerY = canvas.height * 0.6;
        const radius = 80;
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
          shapes.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
          });
        }
      } else if (shapeIndex === 1) {
        // Triangle - fewer points
        const centerX = canvas.width * 0.2;
        const centerY = canvas.height * 0.7;
        const size = 100;
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
          const x1 = centerX + Math.cos(angle) * size;
          const y1 = centerY + Math.sin(angle) * size;
          const angle2 = ((i + 1) / 3) * Math.PI * 2 - Math.PI / 2;
          const x2 = centerX + Math.cos(angle2) * size;
          const y2 = centerY + Math.sin(angle2) * size;
          
          for (let t = 0; t < 1; t += 0.15) {
            shapes.push({
              x: x1 + (x2 - x1) * t,
              y: y1 + (y2 - y1) * t,
            });
          }
        }
      } else {
        // Square - fewer points
        const centerX = canvas.width * 0.8;
        const centerY = canvas.height * 0.4;
        const size = 80;
        const halfSize = size / 2;
        
        for (let x = -halfSize; x <= halfSize; x += 10) {
          shapes.push({ x: centerX + x, y: centerY - halfSize });
        }
        for (let y = -halfSize; y <= halfSize; y += 10) {
          shapes.push({ x: centerX + halfSize, y: centerY + y });
        }
        for (let x = halfSize; x >= -halfSize; x -= 10) {
          shapes.push({ x: centerX + x, y: centerY + halfSize });
        }
        for (let y = halfSize; y >= -halfSize; y -= 10) {
          shapes.push({ x: centerX - halfSize, y: centerY + y });
        }
      }
      
      shapeCache[shapeIndex] = shapes;
      return shapes;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 16; // ~60fps

      // Get cached shapes
      const shapeIndex = Math.floor(time / 5000) % 3;
      const currentShapes = getShapes(shapeIndex);
      const transitionProgress = (time % 5000) / 5000;
      const shapeStrength = transitionProgress < 0.7 ? 1 : 1 - (transitionProgress - 0.7) / 0.3;

      // Assign temporary shapes to non-text particles
      let shapeIdx = 0;
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        if (!particle.formingShape && shapeIdx < currentShapes.length && shapeStrength > 0.3) {
          particle.targetX = currentShapes[shapeIdx].x;
          particle.targetY = currentShapes[shapeIdx].y;
          shapeIdx++;
        } else if (!particle.formingShape) {
          particle.targetX = particle.baseX;
          particle.targetY = particle.baseY;
        }
      }

      // OPTIMIZED: Draw connection lines - fewer connections for performance
      const connectionDistance = 100;
      const connectionDistSq = connectionDistance * connectionDistance;
      
      // Only draw lines for every other particle to reduce draw calls
      for (let i = 0; i < particles.length; i += 2) {
        const particle = particles[i];
        
        // Only check nearby particles
        for (let j = i + 1; j < Math.min(i + 20, particles.length); j++) {
          const other = particles[j];
          
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDistSq) {
            const dist = Math.sqrt(distSq);
            const opacity = 0.4 - (dist / 250);
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      // OPTIMIZED: Update and draw particles
      const mouseDistSq = 150 * 150;
      
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        // Force towards target
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const distToTargetSq = dx * dx + dy * dy;
        
        if (distToTargetSq > 1) {
          const distToTarget = Math.sqrt(distToTargetSq);
          const shapeForce = particle.formingShape ? 0.05 : 0.03 * shapeStrength;
          particle.vx += (dx / distToTarget) * shapeForce;
          particle.vy += (dy / distToTarget) * shapeForce;
        }

        // Mouse repulsion - only if mouse is close
        const mouseDx = mouseX - particle.x;
        const mouseDy = mouseY - particle.y;
        const mouseDistSquared = mouseDx * mouseDx + mouseDy * mouseDy;
        
        if (mouseDistSquared < mouseDistSq) {
          const mouseDist = Math.sqrt(mouseDistSquared);
          const angle = Math.atan2(mouseDy, mouseDx);
          const force = (150 - mouseDist) / 150;
          particle.vx -= Math.cos(angle) * 0.5 * force;
          particle.vy -= Math.sin(angle) * 0.5 * force;
        }

        // Apply velocity with damping
        particle.vx *= 0.95;
        particle.vy *= 0.95;
        
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges instead of bouncing
        if (particle.x < 0) {
          particle.x = canvas.width;
        } else if (particle.x > canvas.width) {
          particle.x = 0;
        }
        if (particle.y < 0) {
          particle.y = canvas.height;
        } else if (particle.y > canvas.height) {
          particle.y = 0;
        }

        // Draw particle
        const isActive = particle.formingShape || (distToTargetSq < 2500 && shapeStrength > 0.3);
        ctx.fillStyle = isActive 
          ? 'rgba(148, 163, 184, 1)' 
          : 'rgba(148, 163, 184, 0.6)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

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
