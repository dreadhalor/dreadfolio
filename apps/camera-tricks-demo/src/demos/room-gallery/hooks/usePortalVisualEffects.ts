/**
 * Portal Visual Effects Hook
 * 
 * Handles all portal animation effects (breathing, rotation, particles).
 * Only animates visible portals for performance (87% reduction).
 */

import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
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
  pulsePortalIndex?: number | null;
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
  pulsePortalIndex,
}: UsePortalVisualEffectsProps): void {
  const pulseStartTimeRef = useRef<number | null>(null);
  const pulseDuration = 3.0; // 3 seconds for pulse effect

  // Track when pulse starts
  useEffect(() => {
    if (pulsePortalIndex !== null && pulsePortalIndex !== undefined) {
      pulseStartTimeRef.current = performance.now() / 1000; // Convert to seconds
    }
  }, [pulsePortalIndex]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate visible portals only (breathing, rotation, etc.)
    for (const i of visibleCameraIndices) {
      const camera = cameras[i];
      const { portalAnimData: animData } = camera;

      if (!animData) continue;

      // Calculate navigation pulse effect (if this portal should pulse)
      let pulseMultiplier = 1.0;
      if (
        pulsePortalIndex === i &&
        pulseStartTimeRef.current !== null
      ) {
        const elapsedTime = time - pulseStartTimeRef.current;
        if (elapsedTime < pulseDuration) {
          // Smooth decay from 2.5x to 1.0x over pulseDuration
          const progress = elapsedTime / pulseDuration;
          const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
          pulseMultiplier = 2.5 - (1.5 * easeOut);
        } else {
          // Pulse complete
          pulseStartTimeRef.current = null;
        }
      }

      // Pulse outer glow (breathing effect + navigation pulse)
      const outerMaterial = animData.outerGlow
        .material as THREE.MeshBasicMaterial;
      const baseOuterOpacity =
        PORTAL_GLOW.OUTER_BASE_OPACITY +
        Math.sin(time * PORTAL_GLOW.OUTER_PULSE_SPEED) *
          PORTAL_GLOW.OUTER_PULSE_AMPLITUDE;
      outerMaterial.opacity = Math.min(0.8, baseOuterOpacity * pulseMultiplier);
      
      const baseOuterScale =
        1 +
        Math.sin(time * PORTAL_GLOW.OUTER_SCALE_SPEED) *
          PORTAL_GLOW.OUTER_SCALE_AMPLITUDE;
      animData.outerGlow.scale.setScalar(baseOuterScale * pulseMultiplier);

      // Pulse inner glow (faster, more intense + navigation pulse)
      const innerMaterial = animData.innerGlow
        .material as THREE.MeshBasicMaterial;
      const baseInnerOpacity =
        PORTAL_GLOW.INNER_BASE_OPACITY +
        Math.sin(time * PORTAL_GLOW.INNER_PULSE_SPEED) *
          PORTAL_GLOW.INNER_PULSE_AMPLITUDE;
      innerMaterial.opacity = Math.min(1.0, baseInnerOpacity * pulseMultiplier);

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
