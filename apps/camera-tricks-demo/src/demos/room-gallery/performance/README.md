# Performance-Optimized Room Components

This directory contains all the optimized 3D room implementations that achieve 60 FPS.

## 🏗️ Architecture

### Before Refactor
```
OptimizedRoomDecorations.tsx (719 lines)
├── InstancedBooks
├── InstancedPlants
├── InstancedFrames
├── InstancedLamps
├── RotatingPlanets
├── OptimizedLibraryRoom
├── OptimizedGalleryRoom
├── OptimizedGreenhouseRoom
├── OptimizedLoungeRoom
├── OptimizedOfficeRoom
└── OptimizedObservatoryRoom
```

**Problems:**
- ❌ Single file with 719 lines
- ❌ Hard to navigate and find specific rooms
- ❌ Large git diffs mixing multiple concerns
- ❌ High cognitive load

### After Refactor
```
performance/
├── OptimizedRoomDecorations.tsx (re-export hub)
├── shared/
│   └── InstancedComponents.tsx (reusable components)
└── rooms/
    ├── index.ts
    ├── LibraryRoom.tsx (~200 lines)
    ├── GalleryRoom.tsx (~100 lines)
    ├── GreenhouseRoom.tsx (~100 lines)
    ├── LoungeRoom.tsx (~120 lines)
    ├── OfficeRoom.tsx (~130 lines)
    └── ObservatoryRoom.tsx (~90 lines)
```

**Benefits:**
- ✅ Each room in its own file (~100 lines each)
- ✅ Easy to find and modify individual rooms
- ✅ Clear git diffs (changes isolated to specific rooms)
- ✅ Shared components centralized
- ✅ Extracted magic numbers to named constants
- ✅ Added material compatibility documentation

## 📁 File Organization

### `OptimizedRoomDecorations.tsx`
Main entry point that re-exports all rooms. Maintains backward compatibility.

### `shared/InstancedComponents.tsx`
Reusable instanced mesh components used across multiple rooms:
- `InstancedBooks` - Animated floating books
- `InstancedPlants` - Swaying cylindrical plants
- `InstancedFrames` - Wall picture frames
- `InstancedLamps` - Ceiling cone lights
- `RotatingPlanets` - Animated planetary system

**Features:**
- All magic numbers extracted to named constants
- Material compatibility notes inline
- Proper memoization of random values

### `rooms/*.tsx`
Individual room implementations:

#### **LibraryRoom.tsx** 🏛️
Cozy reading room with books, fireplace, and furniture
- 36 animated floating books
- Fireplace with emissive glow
- Procedural wood and carpet textures
- Floating dust particles

#### **GalleryRoom.tsx** 🖼️
Art gallery with pedestals and metallic spheres
- 6 marble pedestals
- 6 metallic spheres (meshStandardMaterial)
- 12 wall frames
- Marble floor texture

#### **GreenhouseRoom.tsx** 🌿
Botanical garden with plants and fountain
- 18 swaying plants
- 8 planter boxes
- Central water fountain
- Fireflies

#### **LoungeRoom.tsx** 🛋️
Relaxation area with bar and seating
- Bar with 6 stools
- 2 sofas and coffee table
- 8 metallic bottles
- Ambient bubbles

#### **OfficeRoom.tsx** 💼
Professional workspace
- Desk with computer monitor
- 4 filing cabinets
- Bookshelf
- Colorful desk items

#### **ObservatoryRoom.tsx** 🔭
Stargazing room with telescope
- Central metallic telescope
- 3 rotating planets
- 6 star charts
- 100 twinkling stars

## 🎨 Material Strategy

### meshBasicMaterial
**Use for:** Flat surfaces, floors, ceilings
**Supports:** `color`, `map`, `transparent`, `opacity`
**Does NOT support:** Any lighting properties

### meshLambertMaterial
**Use for:** Most 3D objects that need depth
**Supports:** `color`, `map`, `emissive`, `emissiveIntensity`, `transparent`, `opacity`
**Performance:** Very cheap (per-vertex lighting)

### meshStandardMaterial
**Use for:** Hero objects needing metallic/rough effects
**Supports:** ALL properties including `metalness`, `roughness`, `normalMap`
**Performance:** More expensive (per-pixel lighting)
**Usage:** Limited to ~3-6 objects per room

## 📊 Performance Metrics

- **Draw Calls:** ~20-25 per room
- **Frame Rate:** Solid 60 FPS
- **Memory:** Stable (no leaks)
- **Technique:** Instanced rendering + geometry merging

## 🔧 Constants Pattern

All magic numbers are extracted to named constants:

```typescript
const FURNITURE = {
  DESK: { X: 0, Y: 1, Z: -7, WIDTH: 3.5, HEIGHT: 0.2, DEPTH: 2 },
  CHAIR: { X: 0, Y: 0.6, Z: -5, WIDTH: 1.2, HEIGHT: 1, DEPTH: 1 },
} as const;
```

This makes it easy to:
- Understand what values represent
- Adjust layouts without hunting for numbers
- Maintain consistency across rooms

## 🚀 Usage

```typescript
import { OptimizedLibraryRoom } from './performance/OptimizedRoomDecorations';

// Or import from individual files
import { LibraryRoom } from './performance/rooms/LibraryRoom';
```

Both work! The main file maintains backward compatibility.
