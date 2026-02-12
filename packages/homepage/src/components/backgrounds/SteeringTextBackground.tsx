import { useEffect, useRef, useState } from 'react';

interface Vehicle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  targetX: number;
  targetY: number;
  maxSpeed: number;
  maxForce: number;
  size: number;
}

export function SteeringTextBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle scroll separately to avoid recreating particles
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    // Make canvas taller to account for parallax scrolling
    const parallaxFactor = 0.15;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const extraHeight = maxScroll * parallaxFactor;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight + extraHeight;

    const vehicles: Vehicle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;

    // Create text particles
    const createTextParticles = () => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (!tempCtx) return [];

      const text = 'SCOTT HETRICK';
      const fontSize = Math.min(canvas.width * 0.08, 90);
      
      tempCanvas.width = canvas.width;
      tempCanvas.height = fontSize * 2;
      
      tempCtx.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
      tempCtx.fillStyle = 'white';
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const points: { x: number; y: number }[] = [];

      const step = 6;
      for (let y = 0; y < tempCanvas.height; y += step) {
        for (let x = 0; x < tempCanvas.width; x += step) {
          const i = (y * tempCanvas.width + x) * 4;
          if (imageData.data[i + 3] > 128) {
            const centerY = canvas.height * 0.25;
            points.push({
              x: x,
              y: centerY + y - tempCanvas.height / 2,
            });
          }
        }
      }

      return points;
    };

    const points = createTextParticles();
    console.log(`Created ${points.length} steering particles`);

    // Create vehicles for each point
    points.forEach((point) => {
      vehicles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        targetX: point.x,
        targetY: point.y,
        maxSpeed: 8,
        maxForce: 0.8,
        size: 2,
      });
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY + scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Steering behaviors
    const arrive = (vehicle: Vehicle, targetX: number, targetY: number) => {
      const dx = targetX - vehicle.x;
      const dy = targetY - vehicle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.1) return { x: 0, y: 0 };

      let speed = vehicle.maxSpeed;
      if (dist < 100) {
        speed = (dist / 100) * vehicle.maxSpeed;
      }

      const desiredVx = (dx / dist) * speed;
      const desiredVy = (dy / dist) * speed;

      let steerX = desiredVx - vehicle.vx;
      let steerY = desiredVy - vehicle.vy;

      const steerMag = Math.sqrt(steerX * steerX + steerY * steerY);
      if (steerMag > vehicle.maxForce) {
        steerX = (steerX / steerMag) * vehicle.maxForce;
        steerY = (steerY / steerMag) * vehicle.maxForce;
      }

      return { x: steerX, y: steerY };
    };

    const flee = (vehicle: Vehicle, targetX: number, targetY: number) => {
      const dx = targetX - vehicle.x;
      const dy = targetY - vehicle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 80) return { x: 0, y: 0 };

      const desiredVx = -(dx / dist) * vehicle.maxSpeed;
      const desiredVy = -(dy / dist) * vehicle.maxSpeed;

      let steerX = desiredVx - vehicle.vx;
      let steerY = desiredVy - vehicle.vy;

      const steerMag = Math.sqrt(steerX * steerX + steerY * steerY);
      if (steerMag > vehicle.maxForce) {
        steerX = (steerX / steerMag) * vehicle.maxForce;
        steerY = (steerY / steerMag) * vehicle.maxForce;
      }

      return { x: steerX, y: steerY };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connection lines first
      const connectionDistance = 100;
      const connectionDistSq = connectionDistance * connectionDistance;
      
      for (let i = 0; i < vehicles.length; i += 2) {
        const vehicle = vehicles[i];
        
        for (let j = i + 1; j < Math.min(i + 20, vehicles.length); j++) {
          const other = vehicles[j];
          
          const dx = vehicle.x - other.x;
          const dy = vehicle.y - other.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDistSq) {
            const dist = Math.sqrt(distSq);
            const opacity = 0.5 - (dist / 200);
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(vehicle.x, vehicle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      vehicles.forEach((vehicle) => {
        // Apply arrive force to target
        const arriveForce = arrive(vehicle, vehicle.targetX, vehicle.targetY);
        vehicle.ax = arriveForce.x;
        vehicle.ay = arriveForce.y;

        // Apply flee force from mouse
        const fleeForce = flee(vehicle, mouseX, mouseY);
        vehicle.ax += fleeForce.x * 8;
        vehicle.ay += fleeForce.y * 8;

        // Update velocity
        vehicle.vx += vehicle.ax;
        vehicle.vy += vehicle.ay;

        // Limit speed
        const speed = Math.sqrt(vehicle.vx * vehicle.vx + vehicle.vy * vehicle.vy);
        if (speed > vehicle.maxSpeed) {
          vehicle.vx = (vehicle.vx / speed) * vehicle.maxSpeed;
          vehicle.vy = (vehicle.vy / speed) * vehicle.maxSpeed;
        }

        // Update position
        vehicle.x += vehicle.vx;
        vehicle.y += vehicle.vy;

        // Reset acceleration
        vehicle.ax = 0;
        vehicle.ay = 0;

        // Wrap edges
        if (vehicle.x < 0) vehicle.x = canvas.width;
        if (vehicle.x > canvas.width) vehicle.x = 0;
        if (vehicle.y < 0) vehicle.y = canvas.height;
        if (vehicle.y > canvas.height) vehicle.y = 0;

        // Draw vehicle
        ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
        ctx.beginPath();
        ctx.arc(vehicle.x, vehicle.y, vehicle.size, 0, Math.PI * 2);
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
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 2,
        transform: `translateY(${-scrollY * 0.15}px)`,
      }}
    />
  );
}
