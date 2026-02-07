# Room Design Guidelines

Guidelines and specifications for designing 3D rooms in the room gallery, based on the Minesweeper room redesign.

## Table of Contents
- [Clearance Zones](#clearance-zones)
- [Mobile Visibility](#mobile-visibility)
- [Performance Constraints](#performance-constraints)
- [Visual Design Principles](#visual-design-principles)
- [Animation Guidelines](#animation-guidelines)
- [Element Positioning Strategy](#element-positioning-strategy)
- [Color & Theme](#color--theme)
- [Technical Implementation](#technical-implementation)

---

## Clearance Zones

**Critical zones that MUST remain unobstructed for proper UX:**

### Portal Clearance
- **X**: `offsetX ± 1.5` units
- **Y**: `2` to `4` units
- **Z**: `4.2` to `5.8` units
- **Purpose**: Interactive portal area for app launching
- **Note**: Portal is at Z=5, radius ~2.5 units

### Title Label Clearance
- **X**: `offsetX ± 2.5` units
- **Y**: `5.5` to `7` units (title at Y=6.3)
- **Z**: `5` to `6` units
- **Purpose**: In-scene title text rendered above portal
- **Note**: Larger on mobile, needs more horizontal clearance

### Description Label Clearance
- **X**: `offsetX ± 4` units
- **Y**: `0.5` to `2` units (description at Y=1.2)
- **Z**: `7` to `9.5` units
- **Purpose**: In-scene description text rendered below portal, closer to camera
- **Note**: Wraps earlier on mobile, needs generous clearance

### Flanking Zone (Acceptable)
- **X**: `offsetX ± 3` to `offsetX ± 5` units at portal depth
- **Y**: Any height
- **Z**: `3.5` to `4.5` units (just in front of portal)
- **Purpose**: Small framing elements for depth (e.g., small cubes, markers)
- **Max Size**: 0.7-0.8 units

---

## Mobile Visibility

**Key consideration: Mobile screens show less horizontal area.**

### Horizontal Positioning
- **Primary elements**: Keep within `X = offsetX ± 7` units
- **Secondary elements**: Can extend to `X = offsetX ± 10` units
- **Wall elements**: At `X = offsetX ± 10` to `offsetX ± 11` (visible edge)
- **Avoid**: Elements beyond `X = offsetX ± 13` units (often off-screen on mobile)

### Vertical Distribution
- **Ground level**: `Y = 0` to `Y = 2`
- **Mid-level**: `Y = 2` to `Y = 6`
- **Ceiling/High**: `Y = 6` to `Y = 10`
- **Tip**: Spread elements vertically to maximize visible space usage

### Depth (Z-axis) Strategy
- **Far background**: `Z = -8` to `Z = -6`
- **Mid-ground**: `Z = -3` to `Z = -1`
- **Portal level**: `Z = 4` to `Z = 6`
- **Near camera**: `Z = 7` to `Z = 10` (careful - can obstruct view)
- **Very close**: `Z = 10+` (reserve for floating elements above portal)

---

## Performance Constraints

**All 15 rooms render simultaneously - optimize aggressively.**

### Draw Call Budget
- **Target**: 20-30 draw calls per room
- **Method**: Merge geometries by material/color
- **Example**: All wall tiles of same color → 1 mesh

### Animated Elements Limit
- **Maximum**: 12-15 animated objects per room
- **Typical**: 5-7 animated objects
- **Reason**: All rooms animate simultaneously (15 rooms × animations = load)
- **Comparison**: Homepage room has 7 animated spheres, other rooms have 3-7

### Animation Performance
- **Use direct `for` loops** instead of `forEach` in `useFrame`
- **Cache config values** outside loops (don't access `MINESWEEPER_CONFIG.FLAGS.floatSpeed` every iteration)
- **Use direct array access** instead of closure references
- **Example**:
  ```typescript
  // ❌ Bad - slow forEach, repeated object access
  flagRefs.current.forEach((flag, idx) => {
    if (flag && flagMarkers[idx]) {
      flag.position.y = flagMarkers[idx].basePosition[1] + 
        Math.sin(time * MINESWEEPER_CONFIG.FLAGS.floatSpeed + flagMarkers[idx].floatOffset) * 
        MINESWEEPER_CONFIG.FLAGS.floatAmplitude;
    }
  });
  
  // ✅ Good - fast for loop, cached values
  const flagSpeed = MINESWEEPER_CONFIG.FLAGS.floatSpeed;
  const flagAmp = MINESWEEPER_CONFIG.FLAGS.floatAmplitude;
  for (let i = 0; i < flagRefs.current.length; i++) {
    const flag = flagRefs.current[i];
    if (flag) {
      const marker = flagMarkers[i];
      flag.position.y = marker.basePosition[1] + Math.sin(time * flagSpeed + marker.floatOffset) * flagAmp;
    }
  }
  ```

### Geometry Optimization
- **Merge static geometries** with `BufferGeometryUtils.mergeGeometries()`
- **Group by material** before merging
- **Avoid individual meshes** for repeated elements
- **Exception**: Animated elements must be separate meshes

---

## Visual Design Principles

### Maximize Visible Space
- **Goal**: Use as much of the visible room volume as possible
- **Method**: Distribute elements across all depths, heights, and sides
- **Balance**: Avoid cluttering center while filling peripheral areas

### Aesthetic Cohesion
- **Choose a clear theme** (e.g., Windows XP Bliss, 90s computer lab, art studio)
- **Color palette**: 2-4 primary colors maximum
- **Element style**: Consistent geometric style (realistic, stylized, abstract)

### Depth & Layering
- **Foreground**: Larger elements close to camera for immediacy
- **Mid-ground**: Portal level, main focal point
- **Background**: Smaller/darker elements for depth perception
- **Overlapping**: Allow some overlap for natural depth

### Empty Space Above Portal
- **Problem**: Area above portal (Y > 6) often feels empty
- **Solution**: Add floating/hanging elements (flags, lights, floating blocks)
- **Position**: Z = 4-7, Y = 7-9 for visibility without obstruction

---

## Animation Guidelines

### Types of Animation
1. **Floating**: Gentle Y-axis sine wave (`0.3-0.5` amplitude)
2. **Rotating**: Slow rotation around Y or multiple axes
3. **Orbiting**: Circular motion in XZ plane
4. **Combined**: Float + rotate for visual interest

### Animation Parameters
- **Float amplitude**: 0.3 to 0.5 units
- **Float speed**: 0.8 to 2.0 (higher = faster)
- **Rotation speed**: 0.2 to 0.5 rad/s (slow, contemplative)
- **Phase offsets**: Vary by index (e.g., `idx * 1.3`) for staggered motion

### Recommended Counts by Element Type
- **Flags/Markers**: 5-6 animated
- **Small floating objects**: 4-5 animated
- **Large decorative elements**: 2-3 animated
- **Total**: 10-12 animated objects maximum

---

## Element Positioning Strategy

### Spatial Distribution Checklist
- [ ] **Background elements** (Z < -5)
- [ ] **Mid-ground elements** (Z = -3 to 0)
- [ ] **Portal flanking** (sides at portal depth)
- [ ] **Foreground elements** (Z > 7, away from description zone)
- [ ] **Wall decorations** (X = ±10, all Z depths)
- [ ] **Ceiling elements** (Y > 7)
- [ ] **Floor elements** (Y < 2)

### Portal Framing Technique
- **Small accent elements** (0.6-0.8 units) flanking portal at X = ±3 to ±5, Z = 3.5-4.5
- **Purpose**: Frame portal, add depth, don't obstruct
- **Count**: 6-8 small elements around portal perimeter

### Visible on Mobile Test
- Preview room at viewport width ~400px
- Check that key elements are visible without panning
- If not: move closer to center (reduce X values)

---

## Color & Theme

### Theme Colors
Define 2-4 primary theme colors in the room config:

```typescript
const THEME_COLORS = {
  primary: '#7CFC00',   // Main theme color
  secondary: '#5EB3E4', // Complementary color
  accent: '#0058D6',    // Accent/highlight
  neutral: '#333333',   // Neutral/dark
};
```

### Apply Colors
1. **Portal**: Update in `portalTheme.ts` using `getPortalTheme()`
2. **App config**: Update `color` field in `apps.ts`
3. **Theme config**: Update in `themes.ts`
4. **Room elements**: Use theme colors for consistency

### Color Guidelines
- **Background/walls**: Lighter, desaturated (sky, grass, neutral tones)
- **Foreground elements**: Brighter, saturated for pop
- **Portal**: Should match or complement room theme
- **Consistency**: All elements should feel part of same palette

---

## Technical Implementation

### File Structure
```
performance/rooms/
├── [RoomName]Room.tsx           # Main room component
└── config/
    └── [RoomName]Config.ts      # Configuration constants
```

### Config File Structure
```typescript
export const ROOM_CONFIG = {
  // Static elements (will be merged)
  ELEMENT_TYPE_1: {
    size: number,
    count: number,
    positions: [{ x, y, z, ...custom }],
  },
  
  // Animated elements (individual meshes)
  ANIMATED_ELEMENT: {
    size: number,
    count: number,
    positions: [{ x, y, z }],
    floatAmplitude: number,
    floatSpeed: number,
    rotationSpeed?: number,
  },
  
  // Color mappings
  COLORS: {
    [key: string]: string,  // hex colors
  },
};
```

### Room Component Pattern
```typescript
export function RoomName({ colors, offsetX }: RoomProps) {
  const matcap = useMatcap();
  
  // Static geometries - merged by material
  const staticGeometries = useMemo(() => {
    // Create and merge geometries
    return mergedGeometry;
  }, [offsetX]);
  
  // Animated elements - individual geometries
  const animatedElements = useMemo(() => {
    return CONFIG.ANIMATED.positions.map((pos, idx) => ({
      geometry: createGeometry(),
      basePosition: [offsetX + pos.x, pos.y, pos.z],
      floatOffset: idx * 1.3,
    }));
  }, [offsetX]);
  
  // Animation refs
  const elementRefs = useRef<(THREE.Mesh | null)[]>([]);
  
  // Optimized animation loop
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const speed = CONFIG.ANIMATED.floatSpeed;
    const amp = CONFIG.ANIMATED.floatAmplitude;
    
    for (let i = 0; i < elementRefs.current.length; i++) {
      const element = elementRefs.current[i];
      if (element) {
        const data = animatedElements[i];
        element.position.y = data.basePosition[1] + Math.sin(time * speed + data.floatOffset) * amp;
      }
    }
  });
  
  return (
    <>
      {/* Static merged geometry */}
      <mesh geometry={staticGeometries}>
        <meshMatcapMaterial matcap={matcap} color={colors.primary} />
      </mesh>
      
      {/* Animated individual meshes */}
      {animatedElements.map((elem, idx) => (
        <mesh
          key={idx}
          ref={(el) => (elementRefs.current[idx] = el)}
          position={elem.basePosition}
          geometry={elem.geometry}
        >
          <meshMatcapMaterial matcap={matcap} color={colors.accent} />
        </mesh>
      ))}
    </>
  );
}
```

### Common Pitfalls
1. **Too many animated elements** - Keep under 12-15
2. **Forgetting clearance zones** - Always document and respect them
3. **Not testing on mobile** - Elements visible on desktop may be off-screen on mobile
4. **Individual meshes for static elements** - Merge them!
5. **Accessing config in loops** - Cache values outside
6. **Using forEach** - Use for loops for better performance

---

## Quick Redesign Checklist

When redesigning a room, follow this checklist:

- [ ] Choose theme with 2-4 colors
- [ ] Document clearance zones in config file
- [ ] Plan element distribution (background, mid, foreground, ceiling, floor)
- [ ] Position elements within mobile visibility range (X = ±7 primary, ±10 secondary)
- [ ] Limit animated elements to 10-12 maximum
- [ ] Merge static geometries by material
- [ ] Optimize animation loop (for loops, cached values)
- [ ] Add floating elements above portal (Y > 7, Z = 4-7)
- [ ] Test on mobile viewport (~400px width)
- [ ] Verify FPS remains stable (aim for 60fps)
- [ ] Update portal color in `portalTheme.ts`
- [ ] Update app and theme colors in configs

---

## Example: Minesweeper Room Summary

**Theme**: Windows XP "Bliss" (grass green, sky blue)

**Colors**:
- Grass: `#7CFC00`
- Sky: `#5EB3E4`
- Portal: `#0058D6` (Windows XP blue)

**Elements**:
- 12 wall tiles (merged by color)
- 24 floor grid tiles (merged: revealed, unrevealed)
- 3 large mine sculptures (merged)
- 5 flag markers (animated, individual)
- 4 small floating mines (animated, individual)
- 3 floating numbered blocks (animated, individual)
- 10 numbered blocks (merged by color)
- 8 portal framing cubes (merged by color)

**Animated Objects**: 12 total (5 flags + 4 small mines + 3 blocks)

**Performance**: ~25 draw calls, stable 60fps

**Key Decisions**:
1. Moved elements from X=±13.5 to X=±10 for mobile
2. Reduced animated count from 20 to 12
3. Added floating elements above portal to fill empty space
4. Used for loops with cached values for animations
5. Merged all static geometries by color
