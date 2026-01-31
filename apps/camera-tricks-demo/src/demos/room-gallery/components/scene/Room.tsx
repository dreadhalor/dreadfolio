import { RoomTheme } from '../../types';
import { getThemeColors } from '../../config/themes';
import { RoomStructure } from './RoomStructure';
import { LibraryRoom } from '../decorations/rooms/LibraryRoom';
import { GalleryRoom } from '../decorations/rooms/GalleryRoom';
import { GreenhouseRoom } from '../decorations/rooms/GreenhouseRoom';
import { LoungeRoom } from '../decorations/rooms/LoungeRoom';
import { OfficeRoom } from '../decorations/rooms/OfficeRoom';
import { ObservatoryRoom } from '../decorations/rooms/ObservatoryRoom';

interface RoomProps {
  offsetX: number;
  theme: RoomTheme;
  isFirst?: boolean;
  isLast?: boolean;
}

export function Room({ offsetX, theme, isFirst = false, isLast = false }: RoomProps) {
  const colors = getThemeColors(theme);

  return (
    <group position={[offsetX, 0, 0]}>
      <RoomStructure colors={colors} isFirst={isFirst} isLast={isLast} />
      
      {/* Unique decorations per theme */}
      {theme === 'warm' && <LibraryRoom colors={colors} />}
      {theme === 'cool' && <GalleryRoom colors={colors} />}
      {theme === 'nature' && <GreenhouseRoom colors={colors} />}
      {theme === 'sunset' && <LoungeRoom colors={colors} />}
      {theme === 'monochrome' && <OfficeRoom colors={colors} />}
      {theme === 'cosmic' && <ObservatoryRoom colors={colors} />}
    </group>
  );
}
