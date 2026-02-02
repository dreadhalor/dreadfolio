import * as THREE from 'three';
import type { RoomData } from '../../types';

/**
 * Type-safe orbital particle with animation properties
 */
interface OrbitalParticle extends THREE.Mesh {
  orbitAngle: number;
  orbitRadius: number;
}

/**
 * Type-safe swirl particle with animation properties
 */
interface SwirlParticle extends THREE.Mesh {
  baseAngle: number;
  baseRadius: number;
  baseDepth: number;
  floatOffset: number;
}

/**
 * Portal configuration constants
 * Defines the number of decorative elements per portal
 */
const PORTAL_CONFIG = {
  ORBITAL_PARTICLES: 20,
  ORNAMENTS: 4,
  SWIRL_PARTICLES: 12,
} as const;

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
 * Creates an ornate 3D portal with animated elements for a room's app
 * 
 * The portal consists of:
 * - Outer glow ring (breathing effect)
 * - Portal surface (app screenshot or black void)
 * - Two rotating torus rings (3D frames)
 * - Inner glow ring (intense highlight)
 * - 20 orbital particles (rotating around portal)
 * - 4 corner ornaments (tetrahedrons at cardinal points)
 * - 12 swirl particles (inner vortex effect)
 * 
 * Special handling for Homepage room:
 * - Uses RGB rainbow colors for particles instead of single theme color
 * - Brighter glow and opacity values
 * 
 * Performance notes:
 * - All geometries are shared across 15 portals (SHARED_GEOMETRIES)
 * - Materials and textures are tracked for proper disposal
 * - Portal is positioned at (0, 0, -5) in camera local space
 * 
 * @param room - Room data containing theme, color, name, and optional screenshot
 * @returns Object containing:
 *   - group: THREE.Group with all portal meshes
 *   - animData: References to animated elements for per-frame updates
 *   - dispose: Function to clean up materials and textures
 * 
 * @example
 * ```typescript
 * const portal = createPortalGroup(ROOMS[0]);
 * camera.add(portal.group);
 * 
 * // In animation loop:
 * portal.animData.torus.rotation.x = time * 0.2;
 * 
 * // On cleanup:
 * portal.dispose();
 * ```
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
    const texture = textureLoader.load(
      room.imageUrl,
      undefined, // onLoad
      undefined, // onProgress
      (error) => {
        console.error(`Failed to load portal texture for ${room.name}:`, error);
        // Fallback: texture will remain black, which is acceptable
      }
    );
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

  // Orbital particles (spheres that will rotate around the portal)
  // For Homepage, use RGB colors; otherwise use room color
  const orbitalParticles: THREE.Mesh[] = [];
  
  for (let i = 0; i < PORTAL_CONFIG.ORBITAL_PARTICLES; i++) {
    // RGB rainbow effect for Homepage portal particles
    const particleColor = isHomepage 
      ? new THREE.Color().setHSL(i / PORTAL_CONFIG.ORBITAL_PARTICLES, 1.0, 0.6)
      : portalColor;
    
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: particleColor,
    });
    materials.push(particleMaterial);
    
    const particle = new THREE.Mesh(SHARED_GEOMETRIES.orbitalParticle, particleMaterial);
    const angle = (i / PORTAL_CONFIG.ORBITAL_PARTICLES) * Math.PI * 2;
    const radius = 2.3;
    // Store initial angle and radius for animation (using type assertion after property assignment)
    (particle as unknown as OrbitalParticle).orbitAngle = angle;
    (particle as unknown as OrbitalParticle).orbitRadius = radius;
    particle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    portalGroup.add(particle);
    orbitalParticles.push(particle as unknown as THREE.Mesh);
  }

  // Corner ornaments (tetrahedrons at cardinal points)
  // RGB colors for Homepage, room color otherwise
  const ornamentColors = isHomepage 
    ? ['#FF0040', '#00FF40', '#0040FF', '#FFFF00'] // RGB + Yellow
    : Array(PORTAL_CONFIG.ORNAMENTS).fill(portalColor);

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
    
    const swirlParticle = new THREE.Mesh(SHARED_GEOMETRIES.swirlParticle, swirlMaterial) as unknown as SwirlParticle;
    const angle = (i / PORTAL_CONFIG.SWIRL_PARTICLES) * Math.PI * 2;
    const radius = 1.2 + Math.random() * 0.5;
    const depth = (Math.random() - 0.5) * 0.3;
    // Store initial values for animation
    swirlParticle.baseAngle = angle;
    swirlParticle.baseRadius = radius;
    swirlParticle.baseDepth = depth;
    swirlParticle.floatOffset = Math.random() * Math.PI * 2; // Random phase offset
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
      orbitalParticles: orbitalParticles as THREE.Mesh[],
      swirlParticles: swirlParticles as THREE.Mesh[],
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
