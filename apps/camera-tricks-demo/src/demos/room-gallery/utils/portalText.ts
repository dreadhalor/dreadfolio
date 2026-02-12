import * as THREE from 'three';

/**
 * Creates a text sprite with background pane for portal labels
 * Uses canvas to render crisp text on translucent black background
 *
 * Text sprites are positioned in world space (see PortalLabels.tsx) to create
 * a trippy parallax effect where labels stay fixed as you move through the gallery
 *
 * @param text - Text to display (title or description)
 * @param fontSize - Font size in px (default 72)
 * @param bold - Whether to use bold font (default true)
 * @param color - Text color (defaults to white)
 * @param scaleFactor - Optional scale multiplier for responsive sizing
 * @param maxTextWidth - Maximum width for text wrapping (default 800, smaller on mobile)
 * @returns THREE.Sprite with text texture on translucent background
 */
export function createPortalTextSprite(
  text: string,
  fontSize: number = 72,
  bold: boolean = true,
  color: string = '#ffffff',
  scaleFactor: number = 1,
  maxTextWidth: number = 800,
): THREE.Sprite {
  if (!text) {
    // Return empty sprite if no text
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ transparent: true, opacity: 0 }),
    );
    return sprite;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  // Configure text styling FIRST to measure text
  context.font = `${bold ? 'bold ' : ''}${fontSize}px system-ui, -apple-system, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Word wrap text to fit max width (passed as parameter, responsive to screen size)
  const words = text.split(' ');
  const allLines: string[] = [];
  let currentLine = '';
  const maxLines = 2;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = context.measureText(testLine);

    if (metrics.width > maxTextWidth && currentLine) {
      allLines.push(currentLine);
      currentLine = word;
      if (allLines.length >= maxLines) break;
    } else {
      currentLine = testLine;
    }
  }

  // Add remaining text with ellipsis if truncated
  if (currentLine && allLines.length < maxLines) {
    allLines.push(currentLine);
  } else if (currentLine && allLines.length >= maxLines) {
    allLines[allLines.length - 1] += '...';
  }

  // Measure actual text dimensions
  let maxLineWidth = 0;
  allLines.forEach((line) => {
    const metrics = context.measureText(line);
    maxLineWidth = Math.max(maxLineWidth, metrics.width);
  });

  // Use consistent canvas size for quality, but draw tight background
  const canvasWidth = 1024;
  const canvasHeight = 256;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Re-set font after canvas resize (canvas reset clears styling)
  context.font = `${bold ? 'bold ' : ''}${fontSize}px system-ui, -apple-system, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Calculate tight background dimensions
  const padding = 24; // Slightly more padding for breathing room
  const borderRadius = 12;
  const lineHeight = fontSize * 1.4;
  const textHeight = allLines.length * lineHeight;

  const bgWidth = maxLineWidth + 2 * padding;
  const bgHeight = textHeight + 2 * padding;
  const bgX = (canvasWidth - bgWidth) / 2;
  const bgY = (canvasHeight - bgHeight) / 2;

  // Draw gradient background for depth
  const gradient = context.createLinearGradient(bgX, bgY, bgX, bgY + bgHeight);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  context.fillStyle = gradient;
  context.beginPath();
  context.roundRect(bgX, bgY, bgWidth, bgHeight, borderRadius);
  context.fill();

  // Add outer glow for depth
  context.shadowColor = 'rgba(0, 0, 0, 0.4)';
  context.shadowBlur = 20;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 4;
  context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  context.lineWidth = 1.5;
  context.stroke();

  // Reset shadow for text
  context.shadowColor = 'transparent';
  context.shadowBlur = 0;

  // Draw text with simple shadow (no glow)
  const startY = canvasHeight / 2 - textHeight / 2 + lineHeight / 2;

  context.fillStyle = color;
  context.shadowColor = 'rgba(0, 0, 0, 0.8)';
  context.shadowBlur = 4;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;

  allLines.forEach((line, i) => {
    context.fillText(line, canvasWidth / 2, startY + i * lineHeight);
  });

  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // Create sprite material
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95, // Higher opacity for better visibility
    depthTest: true,
    depthWrite: false,
  });

  // Create sprite
  const sprite = new THREE.Sprite(spriteMaterial);

  // Scale sprite to appropriate size (aspect ratio matches canvas)
  const aspectRatio = canvasWidth / canvasHeight;
  const spriteHeight = 1.0 * scaleFactor; // Apply scale factor for responsive sizing
  sprite.scale.set(spriteHeight * aspectRatio, spriteHeight, 1);

  return sprite;
}
