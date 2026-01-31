# Room Gallery - 3D Interactive Gallery

A refactored, modular implementation of the 3D room gallery with proper separation of concerns.

## 🏗️ Architecture

### Structure
```
room-gallery/
├── index.tsx                 # Main component (100 lines)
├── config/                   # Configuration & constants
│   ├── constants.ts         # All magic numbers
│   ├── themes.ts            # Room color themes
│   └── rooms.ts             # Room data array
├── types/                    # TypeScript definitions
│   └── index.ts
├── hooks/                    # Custom React hooks
│   ├── useCameraControl.ts  # Camera drag & movement
│   ├── useRoomVisibility.ts # Frustum culling logic
│   └── useRoomNavigation.ts # Current room detection
├── components/
│   ├── scene/               # 3D Scene components
│   │   ├── CameraController.tsx
│   │   ├── Room.tsx
│   │   ├── RoomStructure.tsx
│   │   ├── DividingWall.tsx
│   │   └── SceneLighting.tsx
│   ├── decorations/
│   │   ├── shared/          # Reusable decorations
│   │   │   ├── PictureFrame.tsx
│   │   │   ├── Pedestal.tsx
│   │   │   ├── Lamp.tsx
│   │   │   ├── Plant.tsx
│   │   │   └── Rug.tsx
│   │   └── rooms/           # Room-specific layouts
│   │       ├── LibraryRoom.tsx
│   │       ├── GalleryRoom.tsx
│   │       ├── GreenhouseRoom.tsx
│   │       ├── LoungeRoom.tsx
│   │       ├── OfficeRoom.tsx
│   │       └── ObservatoryRoom.tsx
│   └── ui/                  # HUD components
│       ├── FPSCounter.tsx   # FPS tracking (in-scene)
│       ├── FPSDisplay.tsx   # FPS display (UI overlay)
│       ├── RoomHeader.tsx   # Current room title
│       └── RoomMinimap.tsx  # Room navigation
└── performance/             # Optimization utilities
    ├── SharedResources.tsx  # Shared geometries/materials
    └── InstancedDecorations.tsx # Instanced rendering

```

## 📦 Key Improvements

### Before Refactor:
- ❌ **1 file, 1184 lines** - monolithic
- ❌ Magic numbers everywhere
- ❌ Duplicate FPS tracking code
- ❌ `any` types
- ❌ No reusability
- ❌ Hard to maintain/extend

### After Refactor:
- ✅ **25+ files, avg 50 lines each** - modular
- ✅ All constants centralized
- ✅ Proper TypeScript types
- ✅ Separated concerns (3D scene / UI / config / logic)
- ✅ Reusable components
- ✅ Easy to add new rooms/features
- ✅ Performance optimizations ready to add
- ✅ Git-friendly (changes isolated to specific files)

## 🚀 Adding New Features

### Add a new room:
1. Create decoration file in `components/decorations/rooms/`
2. Add theme colors to `config/themes.ts`
3. Add room data to `config/rooms.ts`
4. Update `Room.tsx` to render new decoration component
5. Done! All other logic (culling, navigation, UI) updates automatically

### Modify existing room:
1. Edit single file in `components/decorations/rooms/`
2. No need to touch anything else

### Add new decoration type:
1. Create component in `components/decorations/shared/`
2. Use it in any room decoration file

## 🎮 Performance Optimizations

### Active Optimizations:
- ✅ **On-Demand Rendering** - Only renders when scene changes (frameloop="demand")
- ✅ **Frustum Culling** - Only renders visible rooms (1-2 at a time)
- ✅ **AdaptiveDpr** - Automatically reduces resolution during performance drops
- ✅ **BakeShadows** - Freezes shadow maps after first render
- ✅ **PerformanceMonitor** - Auto-adjusts DPR based on device capability
- ✅ **Movement Regression** - Temporarily reduces quality during camera drag
- ✅ **Object Reuse** - Reuses Vector3 objects in render loop (no GC pressure)
- ✅ **React 18 Transitions** - Defers expensive room navigation operations
- ✅ **Shared Resources** - Geometries/materials pooled for reuse
- ✅ **Single Shadow Light** - One shadow-casting light for all rooms
- ✅ **AdaptiveEvents** - Optimizes pointer event handling

### Performance Scaling:
The app automatically adjusts quality based on device performance:
- **High Performance** (60+ FPS): DPR up to 2.0, full effects
- **Medium Performance** (30-60 FPS): DPR 1.0-1.5
- **Low Performance** (<30 FPS): DPR 0.5, minimal effects
- **Critical Fallback**: DPR 0.5 locked if performance degrades repeatedly

### Future Optimizations Available:
- Instanced rendering for repeated decorations (utilities ready)
- Level of Detail (LOD) for distant objects

## 🧪 Testing

Dev server: `http://localhost:5178/`
- Drag to move between rooms
- Click minimap to navigate
- FPS counter in top-right
