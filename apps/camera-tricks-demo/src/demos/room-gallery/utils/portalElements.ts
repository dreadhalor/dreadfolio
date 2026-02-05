import * as THREE from 'three';
import type { RoomData } from '../types';
import type { OrbitalParticleMesh, SwirlParticleMesh } from '../types/portalTypes';
import { PORTAL_DIMENSIONS, PORTAL_CONFIG, PORTAL_OPACITY } from '../config/portalDimensions';
import type { PortalTheme } from './portalTheme';
import { getOrbitalParticleColor } from './portalTheme';

/**
 * Shared geometries across all portals for performance
 * Created once and reused by all 15 portals
 */
export const SHARED_GEOMETRIES = {
  outerGlow: new THREE.RingGeometry(
    PORTAL_DIMENSIONS.OUTER_GLOW.inner,
    PORTAL_DIMENSIONS.OUTER_GLOW.outer,
    64
  ),
  portalSurface: new THREE.CircleGeometry(PORTAL_DIMENSIONS.SURFACE_RADIUS, 64),
  torus: new THREE.TorusGeometry(
    PORTAL_DIMENSIONS.TORUS.radius,
    PORTAL_DIMENSIONS.TORUS.tube,
    16,
    64
  ),
  innerGlow: new THREE.RingGeometry(
    PORTAL_DIMENSIONS.INNER_GLOW.inner,
    PORTAL_DIMENSIONS.INNER_GLOW.outer,
    64
  ),
  orbitalParticle: new THREE.SphereGeometry(PORTAL_DIMENSIONS.ORBITAL_PARTICLE_SIZE, 8, 8),
  ornament: new THREE.TetrahedronGeometry(PORTAL_DIMENSIONS.ORNAMENT_SIZE),
  swirlParticle: new THREE.SphereGeometry(PORTAL_DIMENSIONS.SWIRL_PARTICLE_SIZE, 8, 8),
};

/**
 * Creates the main portal frame elements (glows, surface, torus rings)
 */
export function createPortalFrame(
  room: RoomData,
  theme: PortalTheme,
  materials: THREE.Material[],
  textures: THREE.Texture[]
): {
  outerGlow: THREE.Mesh;
  portalSurface: THREE.Mesh;
  torus: THREE.Mesh;
  torus2: THREE.Mesh;
  innerGlow: THREE.Mesh;
} {
  // Outer glow ring (flat, large, faint)
  const outerGlowMaterial = new THREE.MeshBasicMaterial({
    color: theme.color,
    opacity: theme.opacity.outerGlow,
    transparent: true,
    side: THREE.DoubleSide,
  });
  materials.push(outerGlowMaterial);
  const outerGlow = new THREE.Mesh(SHARED_GEOMETRIES.outerGlow, outerGlowMaterial);

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
      opacity: PORTAL_OPACITY.PORTAL_SURFACE_FALLBACK,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }
  
  materials.push(portalSurfaceMaterial);
  const portalSurface = new THREE.Mesh(SHARED_GEOMETRIES.portalSurface, portalSurfaceMaterial);

  // 3D Torus ring #1 (main portal frame - thick and dimensional)
  const torusMaterial = new THREE.MeshBasicMaterial({
    color: theme.color,
    opacity: theme.opacity.torus,
    transparent: true,
  });
  materials.push(torusMaterial);
  const torus = new THREE.Mesh(SHARED_GEOMETRIES.torus, torusMaterial);
  
  // 3D Torus ring #2 (rotates on different axis for intersecting effect)
  const torus2Material = new THREE.MeshBasicMaterial({
    color: theme.color,
    opacity: theme.opacity.torus,
    transparent: true,
  });
  materials.push(torus2Material);
  const torus2 = new THREE.Mesh(SHARED_GEOMETRIES.torus, torus2Material);

  // Inner glow ring (bright, intense, flat)
  const innerGlowMaterial = new THREE.MeshBasicMaterial({
    color: theme.color,
    opacity: theme.opacity.innerGlow,
    transparent: true,
    side: THREE.DoubleSide,
  });
  materials.push(innerGlowMaterial);
  const innerGlow = new THREE.Mesh(SHARED_GEOMETRIES.innerGlow, innerGlowMaterial);

  return { outerGlow, portalSurface, torus, torus2, innerGlow };
}

/**
 * Creates orbital particles that rotate around the portal
 * Homepage uses rainbow colors, others use room color
 */
export function createOrbitalParticles(
  theme: PortalTheme,
  materials: THREE.Material[]
): OrbitalParticleMesh[] {
  const particles: OrbitalParticleMesh[] = [];
  
  for (let i = 0; i < PORTAL_CONFIG.ORBITAL_PARTICLES; i++) {
    const particleColor = getOrbitalParticleColor(i, PORTAL_CONFIG.ORBITAL_PARTICLES, theme);
    
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: particleColor,
    });
    materials.push(particleMaterial);
    
    const particle = new THREE.Mesh(SHARED_GEOMETRIES.orbitalParticle, particleMaterial) as OrbitalParticleMesh;
    const angle = (i / PORTAL_CONFIG.ORBITAL_PARTICLES) * Math.PI * 2;
    
    // Store initial angle and radius for animation
    particle.orbitAngle = angle;
    particle.orbitRadius = PORTAL_DIMENSIONS.ORBITAL_RADIUS;
    
    particle.position.set(
      Math.cos(angle) * PORTAL_DIMENSIONS.ORBITAL_RADIUS,
      Math.sin(angle) * PORTAL_DIMENSIONS.ORBITAL_RADIUS,
      0
    );
    
    particles.push(particle);
  }
  
  return particles;
}

/**
 * Creates corner ornaments (tetrahedrons at cardinal points)
 * RGB colors for Homepage, room color otherwise
 */
export function createOrnaments(
  theme: PortalTheme,
  materials: THREE.Material[]
): THREE.Mesh[] {
  const ornaments: THREE.Mesh[] = [];
  const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
  
  angles.forEach((angle, idx) => {
    const ornamentMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(theme.ornamentColors[idx]),
    });
    materials.push(ornamentMaterial);
    
    const ornament = new THREE.Mesh(SHARED_GEOMETRIES.ornament, ornamentMaterial);
    ornament.position.set(
      Math.cos(angle) * PORTAL_DIMENSIONS.ORNAMENT_DISTANCE,
      Math.sin(angle) * PORTAL_DIMENSIONS.ORNAMENT_DISTANCE,
      0
    );
    ornament.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    ornaments.push(ornament);
  });
  
  return ornaments;
}

/**
 * Creates swirling energy particles (inner vortex)
 */
export function createSwirlParticles(
  theme: PortalTheme,
  materials: THREE.Material[]
): SwirlParticleMesh[] {
  const particles: SwirlParticleMesh[] = [];
  
  for (let i = 0; i < PORTAL_CONFIG.SWIRL_PARTICLES; i++) {
    const swirlMaterial = new THREE.MeshBasicMaterial({
      color: theme.color,
      opacity: PORTAL_OPACITY.SWIRL_PARTICLE,
      transparent: true,
    });
    materials.push(swirlMaterial);
    
    const particle = new THREE.Mesh(SHARED_GEOMETRIES.swirlParticle, swirlMaterial) as SwirlParticleMesh;
    const angle = (i / PORTAL_CONFIG.SWIRL_PARTICLES) * Math.PI * 2;
    const radius = PORTAL_DIMENSIONS.SWIRL_RADIUS_BASE + Math.random() * PORTAL_DIMENSIONS.SWIRL_RADIUS_VARIANCE;
    const depth = (Math.random() - 0.5) * PORTAL_DIMENSIONS.SWIRL_DEPTH_RANGE;
    
    // Store initial values for animation
    particle.baseAngle = angle;
    particle.baseRadius = radius;
    particle.baseDepth = depth;
    particle.floatOffset = Math.random() * Math.PI * 2; // Random phase offset
    
    particle.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      depth
    );
    
    particles.push(particle);
  }
  
  return particles;
}
