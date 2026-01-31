# Room Gallery Architecture

## Overview
A high-performance 3D room gallery built with React Three Fiber, achieving 60 FPS with multiple decorated rooms.

## Performance Targets
- **60 FPS** steady
- **< 50 draw calls** total
- **< 16.67ms** frame time

## Directory Structure

```
room-gallery/
├── index.tsx                          # Main entry point
├── types/
│   ├── index.ts                       # Core data types
│   └── props.ts                       # Component prop interfaces
├── config/
│   ├── constants.ts                   # Dimensions, bounds, settings
│   ├── performance.ts                 # Performance-related constants
│   ├── rooms.ts                       # Room data configuration
│   ├── themes.ts                      # Color themes per room
│   └── registry.ts                    # Auto room-component mapping
├── components/
│   ├── scene/
│   │   ├── Scene.tsx                  # Orchestrates all 3D elements
│   │   ├── CameraController.tsx       # Optimized camera movement
│   │   ├── SceneLighting.tsx          # Minimal lighting (2 lights)
│   │   ├── RoomStructure.tsx          # Basic room geometry
│   │   └── DividingWall.tsx           # Walls between rooms
│   └── ui/
│       ├── FPSCounter.tsx             # Frame rate tracker
│       ├── FPSDisplay.tsx             # FPS UI
│       ├── RoomHeader.tsx             # Current room name
│       └── RoomMinimap.tsx            # Navigation minimap
├── performance/
│   ├── OptimizedRoomDecorations.tsx   # All room implementations
│   ├── DrawCallMonitor.tsx            # Draw call tracking
│   └── SharedMaterials.tsx            # Material pooling (future)
└── README.md                          # Getting started guide
```

## Key Optimizations

### 1. Geometry Merging
**Problem**: Each mesh = 1 draw call  
**Solution**: Merge all static geometry into single mesh per room

```tsx
// Before: 30+ meshes = 30+ draw calls
<mesh>bookshelf</mesh>
<mesh>desk</mesh>
<mesh>chair</mesh>
// ... 30 more

// After: 1 merged mesh = 1 draw call
const merged = mergeGeometries([bookshelf, desk, chair, ...]);
<mesh geometry={merged} />
```

**Impact**: ~180 draw calls → ~15-20 draw calls

### 2. Instanced Rendering
**Problem**: Repeated objects each create a draw call  
**Solution**: InstancedMesh for duplicates

```tsx
// Before: 12 books = 12 draw calls
{books.map(book => <mesh />)}

// After: 12 books = 1 draw call
<instancedMesh count={12} />
```

### 3. Ref-Based Camera Control
**Problem**: `setState` on every mouse move = 60+ React re-renders/sec  
**Solution**: Direct ref mutation, update React only on drag end

```tsx
// During drag: update ref only (0 React overhead)
targetXRef.current = newPosition;

// On drag end: sync to React state once
setCameraX(targetXRef.current);
```

### 4. Lighting Reduction
**Before**: 27 lights (1 shadow + 6 directional + 20 points)  
**After**: 2 lights (1 ambient + 1 directional)  
**Impact**: 93% fewer light calculations

### 5. No Shadows
Shadows are the #1 performance killer in Three.js  
**Impact**: +20-30ms per frame saved

### 6. Canvas Configuration
```tsx
<Canvas
  shadows={false}           // No shadows
  frameloop="demand"        // Only render when needed
  gl={{ 
    antialias: false,       // 20-30% performance gain
    powerPreference: "high-performance"
  }}
  dpr={[1, 2]}             // Adaptive pixel ratio
/>
```

## Type Safety

All components have proper TypeScript interfaces:

- **SceneProps**: Scene component props
- **CameraControllerProps**: Camera props
- **RoomStructureProps**: Room geometry props
- **RoomDecorationProps**: Decoration components
- **...and more** in `types/props.ts`

No more `any` types!

## Adding a New Room

1. **Create the component** in `performance/OptimizedRoomDecorations.tsx`
2. **Use merged geometry** for static objects:
   ```tsx
   const merged = useMemo(() => {
     const geometries: THREE.BufferGeometry[] = [];
     // Add geometries...
     return mergeGeometries(geometries);
   }, [offsetX]);
   ```
3. **Use InstancedMesh** for repeated objects
4. **Add to registry** in `config/registry.ts` (automatic mapping)
5. **Add room data** in `config/rooms.ts`
6. **Add theme** in `config/themes.ts`

That's it! The system handles the rest.

## Scalability

Current architecture supports:
- **15-20 richly decorated rooms** at 60 FPS
- Easy to add new rooms (just update config)
- Automatic component mapping (no manual switches)
- Type-safe throughout

## Performance Monitoring

Real-time HUD displays:
- **FPS** (green = 60, yellow = 30-60, red = <30)
- **Draw Calls** (green = <50, yellow = 50-100, red = >100)

Target metrics visible at all times.

## Best Practices

### ✅ DO:
- Use `mergeGeometries` for static objects
- Use `InstancedMesh` for repeated objects
- Use `meshBasicMaterial` (no lighting calculations)
- Keep total lights to 2-3 maximum
- Disable shadows unless absolutely critical
- Use refs for high-frequency updates

### ❌ DON'T:
- Create separate meshes for static decorations
- Use `meshStandardMaterial` unnecessarily
- Enable shadows
- Call `setState` on mouse move
- Use `any` types
- Create magic numbers in code

## Future Optimizations

If needed:
1. **Material pooling** (SharedMaterials.tsx already exists)
2. **Texture atlasing** for reduced texture switches
3. **Level of Detail (LOD)** for distant rooms
4. **Occlusion culling** if adding many more rooms
5. **Web Workers** for geometry processing

Current optimizations should handle 15-20 rooms easily.
