import { useMemo } from 'react';
import * as THREE from 'three';
import { ROOMS } from '../../config/rooms';
import { CAMERA_HEIGHT, CAMERA_Z_POSITION } from '../../config/constants';
import { PORTAL_DIMENSIONS } from '../../config/portalDimensions';
import { createPortalTextSprite } from '../../utils/portalText';
import { useIsMobile } from '../../hooks/useIsMobile';

/**
 * Portal Labels Component
 * Renders title and description text sprites for each room's portal
 * Text is positioned in world space and does not follow the camera
 *
 * Features:
 * - Alternates position (above/below portal) for visual variety
 * - Title and description at different Z depths for parallax effect
 * - Creates trippy effect as text drifts by while moving through rooms
 */
export function PortalLabels() {
  const isMobile = useIsMobile();

  // Create text sprites for all rooms (memoized for performance)
  const textSprites = useMemo(() => {
    // Calculate portal position in world space:
    // Camera is at (roomX, CAMERA_HEIGHT, CAMERA_Z_POSITION) = (roomX, 3, 10)
    // Portal is at camera local (0, 0, CAMERA_SPACE_Z) = (0, 0, -5)
    // So portal in world space is at (roomX, 3, 5)

    const portalWorldZ = CAMERA_Z_POSITION + PORTAL_DIMENSIONS.CAMERA_SPACE_Z; // 10 + (-5) = 5
    const portalCenterY = CAMERA_HEIGHT; // 3
    const portalRadius = PORTAL_DIMENSIONS.OUTER_GLOW.outer; // 2.5

    // Responsive sizing: larger on mobile, smaller on desktop
    const scaleFactor = isMobile ? 1.5 : 0.85;
    // Text wrapping: wrap sooner on mobile to prevent edge clipping
    const maxTitleWidth = 800;
    const maxDescWidth = isMobile ? 700 : 800;

    const allSprites: Array<{ sprite: THREE.Sprite; roomId: string }> = [];

    ROOMS.forEach((room) => {
      // Title ABOVE portal, description BELOW portal

      // Create title sprite with responsive scaling and wrapping
      const titleSprite = createPortalTextSprite(
        room.name,
        80,
        true,
        '#ffffff',
        scaleFactor,
        maxTitleWidth,
      );

      // Position title above portal top
      const titleY = portalCenterY + portalRadius + 0.5; // 3 + 2.5 + 0.8 = 6.3

      titleSprite.position.set(room.offsetX, titleY, portalWorldZ + 0.5);
      allSprites.push({ sprite: titleSprite, roomId: `${room.name}-title` });

      // Create description sprite if exists - positioned BELOW portal
      if (room.description) {
        const descSprite = createPortalTextSprite(
          room.description,
          36,
          false,
          '#ffffff',
          scaleFactor,
          maxDescWidth,
        );

        // Position below portal, above floor
        // Portal bottom = 3 - 2.5 = 0.5, so place at 0.5 for visibility
        const descY = 1.2;

        descSprite.position.set(room.offsetX, descY, portalWorldZ + 2); // Closer to camera (higher Z = closer to camera at Z=10)
        descSprite.scale.multiplyScalar(0.85); // Larger description
        allSprites.push({ sprite: descSprite, roomId: `${room.name}-desc` });
      }
    });

    return allSprites;
  }, [isMobile]);

  return (
    <>
      {textSprites.map(({ sprite, roomId }) => (
        <primitive key={roomId} object={sprite} />
      ))}
    </>
  );
}
