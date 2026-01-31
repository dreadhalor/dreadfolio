import * as THREE from 'three';

/**
 * Procedural Texture Generator
 * Creates textures programmatically to avoid external file loading
 * All textures are power-of-2 and optimized for performance
 */

/**
 * Create a seamless wood grain texture
 */
export function createWoodTexture(size = 512): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Base wood color
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(0, 0, size, size);
  
  // Wood grain lines
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * size;
    const width = Math.random() * 3 + 1;
    ctx.strokeStyle = `rgba(101, 67, 33, ${0.3 + Math.random() * 0.3})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + Math.random() * 20 - 10, size);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Create a marble texture
 */
export function createMarbleTexture(size = 512, baseColor = '#f5f5dc'): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Base marble color
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);
  
  // Marble veins
  for (let i = 0; i < 15; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(200, 200, 200, ${0.2 + Math.random() * 0.3})`;
    ctx.lineWidth = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < size; x += 10) {
      ctx.lineTo(x, y + Math.sin(x * 0.02) * 20);
    }
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

/**
 * Create a simple normal map for depth
 */
export function createNormalMap(size = 256): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Base normal (pointing up)
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);
  
  // Add some variation
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 10 + 5;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, '#9090ff');
    gradient.addColorStop(1, '#7070ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Create a color palette texture (8x8 grid of colors)
 */
export function createColorPalette(): THREE.Texture {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const colors = [
    '#8b4513', '#654321', '#d2691e', '#cd853f', // Browns
    '#2f4f4f', '#708090', '#778899', '#b0c4de', // Grays
    '#228b22', '#32cd32', '#90ee90', '#98fb98', // Greens
    '#8b0000', '#dc143c', '#ff6347', '#ffa07a', // Reds
  ];
  
  const cellSize = size / 4;
  colors.forEach((color, i) => {
    const x = (i % 4) * cellSize;
    const y = Math.floor(i / 4) * cellSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, cellSize, cellSize);
  });
  
  return new THREE.CanvasTexture(canvas);
}

/**
 * Create a tile texture (checkerboard or grid)
 */
export function createTileTexture(size = 512, color1 = '#e0e0e0', color2 = '#c0c0c0'): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const tileSize = size / 8;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? color1 : color2;
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      
      // Grout lines
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Create a concrete texture
 */
export function createConcreteTexture(size = 512): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Base concrete color
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  
  // Add noise for concrete texture
  const imageData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = Math.random() * 40 - 20;
    imageData.data[i] += noise;     // R
    imageData.data[i + 1] += noise; // G
    imageData.data[i + 2] += noise; // B
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

/**
 * Create grass/foliage texture
 */
export function createGrassTexture(size = 512): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Base grass color
  ctx.fillStyle = '#3a5f0b';
  ctx.fillRect(0, 0, size, size);
  
  // Grass blades
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(${50 + Math.random() * 50}, ${100 + Math.random() * 50}, 20, 0.6)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.random() * 4 - 2, y - Math.random() * 10);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Create carpet/rug texture
 */
export function createCarpetTexture(size = 512, color = '#8b0000'): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Base carpet color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  
  // Add fabric texture
  const imageData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = Math.random() * 30 - 15;
    imageData.data[i] += noise;
    imageData.data[i + 1] += noise;
    imageData.data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
