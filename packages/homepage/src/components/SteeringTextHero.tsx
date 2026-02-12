import { useEffect, useRef } from 'react';

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

export function SteeringTextHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      // Make canvas slightly wider to prevent text cutoff
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateSize();

    const vehicles: Vehicle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;

    // Create text particles
    const createTextParticles = () => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (!tempCtx) return [];

      const text = 'SCOTT HETRICK';
      const fontSize = Math.min(canvas.width * 0.11, 110);
      
      tempCanvas.width = canvas.width;
      tempCanvas.height = fontSize * 1.8;
      
      // Create artistic, hand-drawn style text
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      const centerX = tempCanvas.width / 2;
      const centerY = tempCanvas.height / 2;
      
      // Draw multiple layers for depth and glow
      // Outer glow
      tempCtx.shadowBlur = 30;
      tempCtx.shadowColor = 'rgba(100, 150, 255, 0.5)';
      tempCtx.font = `900 ${fontSize}px 'Bebas Neue', 'Impact', sans-serif`;
      tempCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      tempCtx.fillText(text, centerX, centerY);
      
      // Main text with gradient
      tempCtx.shadowBlur = 0;
      const gradient = tempCtx.createLinearGradient(0, 0, tempCanvas.width, 0);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.5, '#e2e8f0');
      gradient.addColorStop(1, '#cbd5e1');
      tempCtx.fillStyle = gradient;
      tempCtx.fillText(text, centerX, centerY);
      
      // Inner highlight
      tempCtx.font = `900 ${fontSize * 0.98}px 'Bebas Neue', 'Impact', sans-serif`;
      const highlightGradient = tempCtx.createLinearGradient(0, centerY - fontSize/2, 0, centerY - fontSize/4);
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      tempCtx.fillStyle = highlightGradient;
      tempCtx.fillText(text, centerX, centerY - 2);

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const points: { x: number; y: number }[] = [];

      const step = 5;
      for (let y = 0; y < tempCanvas.height; y += step) {
        for (let x = 0; x < tempCanvas.width; x += step) {
          const i = (y * tempCanvas.width + x) * 4;
          if (imageData.data[i + 3] > 128) {
            const centerY = canvas.height / 2;
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

    // Create vehicles for each point with spiral initialization
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    points.forEach((point) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 200 + 100;
      const spiralX = centerX + Math.cos(angle) * radius;
      const spiralY = centerY + Math.sin(angle) * radius;
      
      // Initial velocity in spiral pattern
      const spiralVx = -Math.sin(angle) * 3;
      const spiralVy = Math.cos(angle) * 3;
      
      vehicles.push({
        x: spiralX,
        y: spiralY,
        vx: spiralVx,
        vy: spiralVy,
        ax: 0,
        ay: 0,
        targetX: point.x,
        targetY: point.y,
        maxSpeed: 8,
        maxForce: 0.8,
        size: 2.5,
      });
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

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

      if (dist > 100) return { x: 0, y: 0 };

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

      vehicles.forEach((vehicle) => {
        // Apply arrive force to target
        const arriveForce = arrive(vehicle, vehicle.targetX, vehicle.targetY);
        vehicle.ax = arriveForce.x;
        vehicle.ay = arriveForce.y;

        // Apply flee force from mouse
        const fleeForce = flee(vehicle, mouseX, mouseY);
        vehicle.ax += fleeForce.x * 10;
        vehicle.ay += fleeForce.y * 10;

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

        // Don't wrap edges - let particles stay within bounds
        // This keeps the text formation clean

        // Draw vehicle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(vehicle.x, vehicle.y, vehicle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      updateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-screen left-[50%] -translate-x-1/2 h-64 md:h-80">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
