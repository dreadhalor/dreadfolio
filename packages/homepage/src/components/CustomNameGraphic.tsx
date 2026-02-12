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

// Sample text to create stylized graphic design
const createStylizedTextPoints = (canvas: HTMLCanvasElement) => {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  if (!tempCtx) return [];

  const text = 'SCOTT HETRICK';
  const fontSize = Math.min(canvas.width * 0.11, 120);
  
  tempCanvas.width = canvas.width;
  tempCanvas.height = fontSize * 2;
  
  // Use a bold, stylized font
  tempCtx.font = `900 ${fontSize}px 'Bebas Neue', 'Impact', 'Arial Black', sans-serif`;
  tempCtx.fillStyle = 'white';
  tempCtx.textAlign = 'center';
  tempCtx.textBaseline = 'middle';
  tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);

  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const points: { x: number; y: number }[] = [];

  // Moderate sampling to create smooth tube paths
  const step = 8;
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

export function CustomNameGraphic() {
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
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateSize();

    const vehicles: Vehicle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;

    const points = createStylizedTextPoints(canvas);
    console.log(`Created stylized text graphic with ${points.length} points`);

    // Create vehicles for each point with spiral initialization
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    points.forEach((point) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 300 + 150;
      const spiralX = centerX + Math.cos(angle) * radius;
      const spiralY = centerY + Math.sin(angle) * radius;
      
      const spiralVx = -Math.sin(angle) * 4;
      const spiralVy = Math.cos(angle) * 4;
      
      vehicles.push({
        x: spiralX,
        y: spiralY,
        vx: spiralVx,
        vy: spiralVy,
        ax: 0,
        ay: 0,
        targetX: point.x,
        targetY: point.y,
        maxSpeed: 10,
        maxForce: 0.9,
        size: 4,
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

      if (dist > 120) return { x: 0, y: 0 };

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

      // Update all vehicles first
      vehicles.forEach((vehicle) => {
        const arriveForce = arrive(vehicle, vehicle.targetX, vehicle.targetY);
        vehicle.ax = arriveForce.x;
        vehicle.ay = arriveForce.y;

        const fleeForce = flee(vehicle, mouseX, mouseY);
        vehicle.ax += fleeForce.x * 12;
        vehicle.ay += fleeForce.y * 12;

        vehicle.vx += vehicle.ax;
        vehicle.vy += vehicle.ay;

        const speed = Math.sqrt(vehicle.vx * vehicle.vx + vehicle.vy * vehicle.vy);
        if (speed > vehicle.maxSpeed) {
          vehicle.vx = (vehicle.vx / speed) * vehicle.maxSpeed;
          vehicle.vy = (vehicle.vy / speed) * vehicle.maxSpeed;
        }

        vehicle.x += vehicle.vx;
        vehicle.y += vehicle.vy;

        vehicle.ax = 0;
        vehicle.ay = 0;
      });

      // Draw continuous neon tubes - connect nearby particles
      const connectionDist = 25;
      
      // Outer glow layer
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#00d4ff';
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      for (let i = 0; i < vehicles.length - 1; i++) {
        const v1 = vehicles[i];
        const v2 = vehicles[i + 1];
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < connectionDist) {
          ctx.beginPath();
          ctx.moveTo(v1.x, v1.y);
          ctx.lineTo(v2.x, v2.y);
          ctx.stroke();
        }
      }
      
      // Middle glow layer
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00eeff';
      ctx.strokeStyle = 'rgba(0, 238, 255, 0.8)';
      ctx.lineWidth = 8;
      
      for (let i = 0; i < vehicles.length - 1; i++) {
        const v1 = vehicles[i];
        const v2 = vehicles[i + 1];
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < connectionDist) {
          ctx.beginPath();
          ctx.moveTo(v1.x, v1.y);
          ctx.lineTo(v2.x, v2.y);
          ctx.stroke();
        }
      }
      
      // Core tube
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
      ctx.lineWidth = 4;
      
      for (let i = 0; i < vehicles.length - 1; i++) {
        const v1 = vehicles[i];
        const v2 = vehicles[i + 1];
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < connectionDist) {
          ctx.beginPath();
          ctx.moveTo(v1.x, v1.y);
          ctx.lineTo(v2.x, v2.y);
          ctx.stroke();
        }
      }
      
      ctx.shadowBlur = 0;

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
