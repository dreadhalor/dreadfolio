import * as THREE from 'three';
import type { RoomData } from '../../types';

/**
 * Shared geometries across all portals for performance
 * Created once and reused by all 15 portals
 */
const SHARED_GEOMETRIES = {
  outerGlow: new THREE.RingGeometry(2.2, 2.5, 64),
  portalSurface: new THREE.CircleGeometry(1.85, 64),
  torus: new THREE.TorusGeometry(2.0, 0.15, 16, 64),
  innerGlow: new THREE.RingGeometry(1.85, 1.95, 64),
  orbitalParticle: new THREE.SphereGeometry(0.08, 8, 8),
  ornament: new THREE.TetrahedronGeometry(0.2),
  swirlParticle: new THREE.SphereGeometry(0.06, 8, 8),
};

/**
 * Creates a portal group with all visual elements for a room's app portal
 * Returns the group, animated element refs, and disposal function
 */
export function createPortalGroup(room: RoomData) {
  const portalGroup = new THREE.Group();
  
  // Special RGB theme for Homepage portal
  const isHomepage = room.theme === 'home';
  const portalColor = isHomepage 
    ? new THREE.Color('#ffffff') // White/bright for Homepage
    : new THREE.Color(room.color);

  // Track materials and textures for disposal
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  // === 3D PORTAL FRAME ===

  // Outer glow ring (flat, large, faint)
  const outerGlowMaterial = new THREE.MeshBasicMaterial({
    color: portalColor,
    opacity: isHomepage ? 0.5 : 0.3, // Brighter for Homepage
    transparent: true,
    side: THREE.DoubleSide,
  });
  materials.push(outerGlowMaterial);
  const outerGlow = new THREE.Mesh(SHARED_GEOMETRIES.outerGlow, outerGlowMaterial);
  portalGroup.add(outerGlow);

  // Main portal surface with app screenshot
  let portalSurfaceMaterial: THREE.MeshBasicMaterial;
  
  if (room.imageUrl) {
    // Load app screenshot texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(room.imageUrl);
    texture.colorSpace = THREE.SRGBColorSpace; // Correct color space for accurate colors
    textures.push(texture);
    
    portalSurfaceMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      opacity: 1.0, // Fully opaque
      transparent: false, // No transparency needed
      side: THREE.DoubleSide,
    });
  } else {
    // Fallback to black void if no image
    portalSurfaceMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.9,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }
  
  materials.push(portalSurfaceMaterial);
  const portalSurface = new THREE.Mesh(SHARED_GEOMETRIES.portalSurface, portalSurfaceMaterial);
  portalGroup.add(portalSurface);

  // 3D Torus ring #1 (main portal frame - thick and dimensional)
  const torusMaterial = new THREE.MeshBasicMaterial({
    color: portalColor,
    opacity: isHomepage ? 0.9 : 0.8, // Brighter for Homepage
    transparent: true,
  });
  materials.push(torusMaterial);
  const torus = new THREE.Mesh(SHARED_GEOMETRIES.torus, torusMaterial);
  portalGroup.add(torus);
  
  // 3D Torus ring #2 (rotates on different axis for intersecting effect)
  const torus2Material = new THREE.MeshBasicMaterial({
    color: portalColor,
    opacity: isHomepage ? 0.9 : 0.8, // Brighter for Homepage
    transparent: true,
  });
  materials.push(torus2Material);
  const torus2 = new THREE.Mesh(SHARED_GEOMETRIES.torus, torus2Material);
  // Start at same position as first ring, but will rotate on Y-axis instead of X-axis
  portalGroup.add(torus2);

  // Inner glow ring (bright, intense, flat)
  const innerGlowMaterial = new THREE.MeshBasicMaterial({
    color: portalColor,
    opacity: isHomepage ? 1.0 : 0.95, // Full brightness for Homepage
    transparent: true,
    side: THREE.DoubleSide,
  });
  materials.push(innerGlowMaterial);
  const innerGlow = new THREE.Mesh(SHARED_GEOMETRIES.innerGlow, innerGlowMaterial);
  portalGroup.add(innerGlow);

  // === DECORATIVE ELEMENTS ===

  // Orbital particles (20 spheres that will rotate around the portal)
  // For Homepage, use RGB colors; otherwise use room color
  const particleCount = 20;
  const orbitalParticles: THREE.Mesh[] = [];
  
  for (let i = 0; i < particleCount; i++) {
    // RGB rainbow effect for Homepage portal particles
    const particleColor = isHomepage 
      ? new THREE.Color().setHSL(i / particleCount, 1.0, 0.6)
      : portalColor;
    
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: particleColor,
    });
    materials.push(particleMaterial);
    
    const particle = new THREE.Mesh(SHARED_GEOMETRIES.orbitalParticle, particleMaterial);
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 2.3;
    // Store initial angle for animation
    (particle as any).orbitAngle = angle;
    (particle as any).orbitRadius = radius;
    particle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    portalGroup.add(particle);
    orbitalParticles.push(particle);
  }

  // Corner ornaments (4 tetrahedrons at cardinal points)
  // RGB colors for Homepage, room color otherwise
  const ornamentColors = isHomepage 
    ? ['#FF0040', '#00FF40', '#0040FF', '#FFFF00'] // RGB + Yellow
    : [portalColor, portalColor, portalColor, portalColor];

  [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((angle, idx) => {
    const ornamentMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(ornamentColors[idx]),
    });
    materials.push(ornamentMaterial);
    
    const ornament = new THREE.Mesh(SHARED_GEOMETRIES.ornament, ornamentMaterial);
    const distance = 2.6;
    ornament.position.set(
      Math.cos(angle) * distance,
      Math.sin(angle) * distance,
      0,
    );
    ornament.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    );
    portalGroup.add(ornament);
  });

  // Swirling energy particles (inner vortex)
  const swirls = 12;
  const swirlParticles: THREE.Mesh[] = [];
  for (let i = 0; i < swirls; i++) {
    const swirlMaterial = new THREE.MeshBasicMaterial({
      color: portalColor,
      opacity: 0.7,
      transparent: true,
    });
    materials.push(swirlMaterial);
    
    const swirlParticle = new THREE.Mesh(SHARED_GEOMETRIES.swirlParticle, swirlMaterial);
    const angle = (i / swirls) * Math.PI * 2;
    const radius = 1.2 + Math.random() * 0.5;
    const depth = (Math.random() - 0.5) * 0.3;
    // Store initial values for animation
    (swirlParticle as any).baseAngle = angle;
    (swirlParticle as any).baseRadius = radius;
    (swirlParticle as any).baseDepth = depth;
    (swirlParticle as any).floatOffset = Math.random() * Math.PI * 2; // Random phase offset
    swirlParticle.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      depth,
    );
    portalGroup.add(swirlParticle);
    swirlParticles.push(swirlParticle);
  }

  // Position portal group in camera's local space
  portalGroup.position.set(0, 0, -5); // Perfectly centered, 5 units forward

  // Position portal group in camera's local space
  portalGroup.position.set(0, 0, -5); // Perfectly centered, 5 units forward

  // Return the group, animated element refs, and disposal function
  return {
    group: portalGroup,
    animData: {
      outerGlow,
      innerGlow,
      portalSurface,
      torus,
      torus2,
      orbitalParticles,
      swirlParticles,
    },
    dispose: () => {
      // Dispose all materials (geometries are shared, so don't dispose those)
      materials.forEach(material => material.dispose());
      
      // Dispose all textures
      textures.forEach(texture => texture.dispose());
      
      // Clear the group
      portalGroup.clear();
    },
  };
}
