/**
 * Portal Visual Effects Hook
 * 
 * Handles all portal animation effects (breathing, rotation, particles).
 * Only animates visible portals for performance (87% reduction).
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  PORTAL_GLOW,
  PORTAL_TORUS,
  ORBITAL_PARTICLES,
  SWIRL_PARTICLES,
} from '../config/portalAnimationConstants';
import type { ExtendedCamera, OrbitalParticleMesh, SwirlParticleMesh } from '../types/portalTypes';

interface UsePortalVisualEffectsProps {
  cameras: ExtendedCamera[];
  visibleCameraIndices: number[];
}

/**
 * Animates portal visual effects for visible cameras only
 * 
 * Effects included:
 * - Outer glow: Pulsing opacity and scale (breathing effect)
 * - Inner glow: Faster pulsing
 * - Torus frames: Slow 3D rotation for depth
 * - Orbital particles: Circular motion around portal
 * - Swirl particles: Floating spiral motion with opacity pulse
 * 
 * Performance: Only animates visible cameras (87% reduction in work)
 */
export function usePortalVisualEffects({
  cameras,
  visibleCameraIndices,
}: UsePortalVisualEffectsProps): void {
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate visible portals only (breathing, rotation, etc.)
    for (const i of visibleCameraIndices) {
      const camera = cameras[i];
      const { portalAnimData: animData } = camera;

      if (!animData) continue;

      // Pulse outer glow (breathing effect)
      const outerMaterial = animData.outerGlow
        .material as THREE.MeshBasicMaterial;
      outerMaterial.opacity =
        PORTAL_GLOW.OUTER_BASE_OPACITY +
        Math.sin(time * PORTAL_GLOW.OUTER_PULSE_SPEED) *
          PORTAL_GLOW.OUTER_PULSE_AMPLITUDE;
      animData.outerGlow.scale.setScalar(
        1 +
          Math.sin(time * PORTAL_GLOW.OUTER_SCALE_SPEED) *
            PORTAL_GLOW.OUTER_SCALE_AMPLITUDE,
      );

      // Pulse inner glow (faster, more intense)
      const innerMaterial = animData.innerGlow
        .material as THREE.MeshBasicMaterial;
      innerMaterial.opacity =
        PORTAL_GLOW.INNER_BASE_OPACITY +
        Math.sin(time * PORTAL_GLOW.INNER_PULSE_SPEED) *
          PORTAL_GLOW.INNER_PULSE_AMPLITUDE;

      // Rotate 3D torus frames (slow rotation for depth)
      if (animData.torus) {
        animData.torus.rotation.x = time * PORTAL_TORUS.ROTATION_SPEED_X;
      }
      if (animData.torus2) {
        animData.torus2.rotation.y = time * PORTAL_TORUS.ROTATION_SPEED_Y;
      }

      // Animate orbital particles (rotate around portal)
      if (animData.orbitalParticles) {
        for (const particle of animData.orbitalParticles) {
          const orbitalParticle = particle as OrbitalParticleMesh;
          const baseAngle = orbitalParticle.orbitAngle;
          const radius = orbitalParticle.orbitRadius;
          const newAngle = baseAngle + time * ORBITAL_PARTICLES.ORBIT_SPEED;
          particle.position.x = Math.cos(newAngle) * radius;
          particle.position.y = Math.sin(newAngle) * radius;
        }
      }

      // Animate swirl particles (floating + slow rotation)
      if (animData.swirlParticles) {
        for (const particle of animData.swirlParticles) {
          const swirlParticle = particle as SwirlParticleMesh;
          const baseAngle = swirlParticle.baseAngle;
          const baseRadius = swirlParticle.baseRadius;
          const baseDepth = swirlParticle.baseDepth;
          const floatOffset = swirlParticle.floatOffset;

          // Slow spiral inward/outward
          const newAngle = baseAngle + time * SWIRL_PARTICLES.ROTATION_SPEED;
          const radiusWave =
            baseRadius +
            Math.sin(time * SWIRL_PARTICLES.RADIUS_WAVE_SPEED + floatOffset) *
              SWIRL_PARTICLES.RADIUS_WAVE_AMPLITUDE;

          // Gentle floating motion
          const floatZ =
            baseDepth +
            Math.sin(time * SWIRL_PARTICLES.FLOAT_SPEED + floatOffset) *
              SWIRL_PARTICLES.FLOAT_AMPLITUDE;

          particle.position.x = Math.cos(newAngle) * radiusWave;
          particle.position.y = Math.sin(newAngle) * radiusWave;
          particle.position.z = floatZ;

          // Pulse opacity for extra mystique
          const particleMaterial = particle.material as THREE.MeshBasicMaterial;
          particleMaterial.opacity =
            SWIRL_PARTICLES.OPACITY_BASE +
            Math.sin(
              time * SWIRL_PARTICLES.OPACITY_PULSE_SPEED + floatOffset,
            ) *
              SWIRL_PARTICLES.OPACITY_PULSE_AMPLITUDE;
        }
      }
    }
  });
}
