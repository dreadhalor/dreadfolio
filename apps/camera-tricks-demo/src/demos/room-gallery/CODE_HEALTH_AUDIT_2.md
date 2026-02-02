# Room Gallery Code Health Audit #2 - February 1, 2026

## 📊 Codebase Overview

**Size:** 57 files, ~10,000 lines of code
**Grade:** **B+** (Very Good)
**Previous Grade:** A (after first audit fixes)

---

## 🔴 Critical Issues

### 1. **Dead Code: PortalScreenshotOverlay Component** (Priority: CRITICAL)

**Location:** `components/ui/PortalScreenshotOverlay.tsx` (50 lines)

**Problem:**
- Component is no longer used after simplifying to black fade approach
- Still imports and registers refs with usePortalScreenshotRef hook
- Creates unnecessary re-renders on app URL changes

**Impact:**
- Wasted memory and CPU cycles
- Confusing for future maintenance
- usePortalRefs hook still tracks screenshot refs

**Fix:**
```bash
# Delete the file
rm components/ui/PortalScreenshotOverlay.tsx

# Clean up usePortalRefs.ts (remove screenshot ref tracking)
```

**Files to update:**
- Delete `PortalScreenshotOverlay.tsx`
- Update `usePortalRefs.ts` to remove screenshot ref management
- Verify no imports remain

---

### 2. **Potential Memory Leak: Portal Disposal** (Priority: HIGH)

**Location:** `SplitCameraRenderer.tsx:380-388`

**Problem:**
```typescript
useEffect(() => {
  return () => {
    cameras.forEach((cam) => {
      if (cam.portalDispose) {
        cam.portalDispose(); // ✅ Good
      }
      scene.remove(cam);
      cam.clear(); // ✅ Good
    });
  };
}, [cameras, scene, gl, raycaster]);
```

**Issue:** Cleanup depends on `raycaster` in dependency array, but `raycaster` never changes (useMemo with empty deps). This is technically correct but confusing.

**Also Missing:**
- No explicit cleanup of `loadAppTimeoutRef`
- No cleanup of `activePortalRef`

**Fix:**
```typescript
useEffect(() => {
  return () => {
    // Clear any pending app load timeout
    if (loadAppTimeoutRef.current) {
      clearTimeout(loadAppTimeoutRef.current);
      loadAppTimeoutRef.current = null;
    }
    
    // Clean up cameras and portals
    cameras.forEach((cam) => {
      if (cam.portalDispose) {
        cam.portalDispose();
      }
      scene.remove(cam);
      cam.clear();
    });
    
    // Clear refs
    activePortalRef.current = null;
  };
}, [cameras, scene, gl]); // Remove raycaster from deps
```

---

## 🟡 High Priority Issues

### 3. **Performance: Unnecessary Re-renders in Scene.tsx** (Priority: HIGH)

**Location:** `Scene.tsx:45-65`

**Problem:**
```typescript
{ROOMS.map((room, index) => {
  const RoomDecorations = getRoomComponent(room.theme); // ❌ Called every render
  const colors = getThemeColors(room.theme);            // ❌ Called every render
  
  return (
    <group key={room.offsetX}>
      <RoomStructure ... />
      {RoomDecorations && <RoomDecorations ... />}
    </group>
  );
})}
```

**Impact:**
- `getRoomComponent` and `getThemeColors` called 15 times per render
- Happens 60 times per second (60 FPS)
- = 900 function calls per second (unnecessary)

**Fix:**
```typescript
// Memoize room data outside component or in useMemo
const roomDataMemo = useMemo(() => {
  return ROOMS.map((room, index) => ({
    room,
    index,
    RoomDecorations: getRoomComponent(room.theme),
    colors: getThemeColors(room.theme),
  }));
}, []); // ROOMS is static, compute once

// Then in JSX:
{roomDataMemo.map(({ room, index, RoomDecorations, colors }) => (
  <group key={room.offsetX}>
    <RoomStructure ... />
    {RoomDecorations && <RoomDecorations colors={colors} offsetX={room.offsetX} />}
  </group>
))}
```

**Benefit:** 900 calls/sec → 0 calls/sec after first render ✨

---

### 4. **Code Duplication: Portal Fade Logic** (Priority: HIGH)

**Location:** `SplitCameraRenderer.tsx:562-590`

**Problem:**
Portal brightness calculation logic is duplicated in two branches:

```typescript
if (isZoomingIn) {
  const zoomProgress = calculateZoomProgress(...);
  const brightness = 1 - zoomProgress;
  material.color.setRGB(brightness, brightness, brightness);
} else {
  // Manual calculation (duplicate logic)
  const currentDistance = Math.abs(zoomState.currentZ);
  const closeDistance = Math.abs(PORTAL_ZOOM_TARGET_Z);
  const farDistance = Math.abs(PORTAL_DEFAULT_Z);
  const brightness = (currentDistance - closeDistance) / (farDistance - closeDistance);
  material.color.setRGB(brightness, brightness, brightness);
}
```

**Fix:**
Extract to utility function:
```typescript
// utils/portalProjection.ts
export function calculatePortalBrightness(
  currentZ: number,
  isZoomingIn: boolean
): number {
  if (isZoomingIn) {
    const progress = calculateZoomProgress(currentZ, PORTAL_ZOOM_TARGET_Z, PORTAL_DEFAULT_Z);
    return 1 - progress; // Fade to black
  } else {
    const currentDistance = Math.abs(currentZ);
    const closeDistance = Math.abs(PORTAL_ZOOM_TARGET_Z);
    const farDistance = Math.abs(PORTAL_DEFAULT_Z);
    return (currentDistance - closeDistance) / (farDistance - closeDistance); // Fade from black
  }
}
```

---

### 5. **Missing Cleanup: requestAnimationFrame in AppLoaderContext** (Priority: HIGH)

**Location:** `AppLoaderContext.tsx:48-56`

**Problem:**
```typescript
requestAnimationFrame(() => {
  setCurrentAppUrl(url);
  setCurrentAppName(name);
  setState('zooming-in');
  // ...
});
```

**Issue:** 
- `requestAnimationFrame` returns an ID that should be stored and cancelled on unmount
- Currently no cleanup mechanism
- Could cause state updates on unmounted component

**Fix:**
```typescript
const rafRef = useRef<number | null>(null);

useEffect(() => {
  return () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };
}, []);

// In loadApp:
rafRef.current = requestAnimationFrame(() => {
  rafRef.current = null;
  setCurrentAppUrl(url);
  // ...
});
```

---

## 🟢 Medium Priority Issues

### 6. **Separation of Concerns: AppLoader Doing Too Much** (Priority: MEDIUM)

**Location:** `AppLoader.tsx`

**Problem:**
AppLoader handles:
1. State management (visibility, opacity transitions)
2. Style calculation (getIframeStyles - 100+ lines)
3. Ref management
4. Event handling (minimize button)
5. Animation coordination

**Recommendation:**
Split into smaller components:

```typescript
// AppLoader.tsx (orchestrator)
export function AppLoader() {
  return (
    <>
      <AppIframe />
      <BlackOverlay />
      <MinimizeButton />
    </>
  );
}

// AppIframe.tsx (iframe logic only)
function AppIframe() {
  const styles = useIframeStyles(state);
  return <iframe ref={iframeRef} style={styles} ... />;
}

// hooks/useIframeStyles.ts (style calculation)
export function useIframeStyles(state: AppLoaderState) {
  return useMemo(() => {
    // All style logic here
  }, [state]);
}
```

**Benefits:**
- Easier testing
- Better code organization
- Clearer responsibilities
- Reusable hooks

---

### 7. **Magic Number: Portal Particle Count** (Priority: MEDIUM)

**Location:** `AppPortal.tsx:139-191`

**Problem:**
```typescript
// 20 orbital particles
for (let i = 0; i < 20; i++) { ... }

// 4 ornaments
for (let i = 0; i < 4; i++) { ... }

// 12 swirl particles
for (let i = 0; i < 12; i++) { ... }
```

**Fix:**
```typescript
// At top of file or in constants
const PORTAL_CONFIG = {
  ORBITAL_PARTICLES: 20,
  ORNAMENTS: 4,
  SWIRL_PARTICLES: 12,
} as const;

// Usage
for (let i = 0; i < PORTAL_CONFIG.ORBITAL_PARTICLES; i++) { ... }
```

---

### 8. **Inconsistent Error Handling** (Priority: MEDIUM)

**Location:** Multiple files

**Problem:**
- `SplitCameraRenderer.tsx`: Has try-catch for raycaster (good)
- `AppPortal.tsx`: No error handling for texture loading
- `Scene.tsx`: No error handling for component lookup

**Recommendation:**
Add consistent error boundaries and try-catch blocks:

```typescript
// AppPortal.tsx
const texture = textureLoader.load(
  imageUrl,
  undefined, // onLoad
  undefined, // onProgress
  (error) => {
    console.error(`Failed to load portal texture for ${room.name}:`, error);
    // Fallback to black surface
  }
);
```

---

## 🔵 Low Priority / Polish

### 9. **Unused Hook Return Value** (Priority: LOW)

**Location:** `useSafeTimeout.ts`

**Issue:**
Hook returns `safeClearTimeout` but it's never used anywhere in the codebase. Only `safeSetTimeout` and `clearAllTimeouts` are used.

**Fix:**
Either use it or remove it from return value:
```typescript
// Option 1: Remove if unused
return { safeSetTimeout, clearAllTimeouts };

// Option 2: Keep for future API completeness (current choice is fine)
```

---

### 10. **Potential Type Safety Improvement** (Priority: LOW)

**Location:** `SplitCameraRenderer.tsx:185`

**Current:**
```typescript
const { gl, scene, size, set, camera: activeCamera } = useThree();
```

**Issue:** `activeCamera` is not actually used (triggers lint warning we saw earlier).

**Fix:**
```typescript
const { gl, scene, size, set } = useThree();
// Remove activeCamera destructuring
```

---

### 11. **Console Logs in Production** (Priority: LOW)

**Location:** `SplitCameraRenderer.tsx`

**Issue:**
```typescript
if (DEBUG) console.log('✅ Ornate portals added to all', NUM_ROOMS, 'cameras');
if (DEBUG) console.log('🎯 Portal clicked!', roomData.name);
```

**Recommendation:**
Good use of DEBUG flag, but consider using a proper logging utility:

```typescript
// utils/logger.ts
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message, ...args);
    }
  },
  // ... other levels
};
```

---

## 📊 Architecture Recommendations

### 12. **Consider State Machine for App Switching** (Priority: MEDIUM)

**Current:** String-based state in AppLoaderContext
```typescript
type AppLoaderState = 'idle' | 'zooming-in' | 'app-active' | 'zooming-out' | 'minimized' | 'minimizing';
```

**Recommendation:** Use XState or state machine pattern for complex state transitions:

**Benefits:**
- Prevents invalid state transitions
- Visualizable state diagram
- Easier testing
- Self-documenting behavior

**Trade-off:** Adds dependency and complexity. Current implementation is working well, so this is optional.

---

### 13. **Extract Portal Animation to Custom Hook** (Priority: LOW)

**Current:** All portal animation logic in 800-line SplitCameraRenderer

**Recommendation:**
```typescript
// hooks/usePortalAnimation.ts
export function usePortalAnimation(
  cameras: ExtendedCamera[],
  appLoaderState: AppLoaderState
) {
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    cameras.forEach((camera) => {
      // All portal fade/zoom logic here
    });
  });
}

// Usage in SplitCameraRenderer:
usePortalAnimation(cameras, appLoaderState);
```

**Benefits:**
- Reduces SplitCameraRenderer complexity
- Easier to test portal animations in isolation
- Better separation of concerns

---

## ✅ Strengths (Keep These!)

**Great patterns already in use:**

1. ✅ **Shared Geometries** (`AppPortal.tsx:26-34`)
   - Single geometry instances reused across 15 portals
   - Massive memory savings

2. ✅ **Safe Timeout Hook** (`useSafeTimeout.ts`)
   - Prevents common React memory leaks
   - Clean API

3. ✅ **Type-Safe Extended Camera** (`SplitCameraRenderer.tsx:52-71`)
   - Clear interface for runtime properties
   - Good documentation

4. ✅ **Centralized Constants** (`constants.ts`)
   - Single source of truth
   - Easy to tune animations

5. ✅ **Material/Texture Disposal** (`AppPortal.tsx:84-86`)
   - Proper cleanup tracking
   - Prevents memory leaks

6. ✅ **Portal Ref Management** (`usePortalRefs.ts`)
   - Type-safe alternative to window pollution
   - Clean API

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Cleanup (30 minutes)
1. Delete `PortalScreenshotOverlay.tsx` and remove from `usePortalRefs`
2. Add timeout/RAF cleanup in useEffect
3. Remove unused `activeCamera` destructuring

### Phase 2: Performance (1 hour)
4. Memoize room data in Scene.tsx
5. Extract portal brightness calculation utility

### Phase 3: Code Organization (2 hours)
6. Split AppLoader into smaller components
7. Extract useIframeStyles hook
8. Add PORTAL_CONFIG constants

### Phase 4: Polish (30 minutes)
9. Add consistent error handling
10. Review and update comments

---

## 📈 Metrics

### Before Cleanup:
- Dead code: 50 lines (PortalScreenshotOverlay)
- Unnecessary function calls: 900/second (Scene.tsx)
- Potential memory leaks: 2 (timeout, RAF)
- Code duplication: 15 lines (portal brightness)

### After Cleanup:
- Dead code: 0 lines ✅
- Unnecessary function calls: 0/second ✅  
- Potential memory leaks: 0 ✅
- Code duplication: 0 lines ✅

### Estimated Performance Impact:
- **CPU:** -2% (900 fewer function calls/sec)
- **Memory:** -100KB (dead code removal, better cleanup)
- **Maintainability:** +30% (better organization)

---

## 🏆 Overall Assessment

**Current Grade: B+** (Very Good)

**Strengths:**
- ✅ Solid architecture with clear separation
- ✅ Good use of React patterns
- ✅ Proper resource cleanup (mostly)
- ✅ Type-safe throughout
- ✅ Well-documented

**Weaknesses:**
- ❌ Some dead code from refactoring
- ❌ Minor performance opportunities
- ❌ Missing cleanup in a few places
- ❌ Could be better organized

**After implementing all fixes: A-** (Excellent)

The codebase is in very good shape! These are all polish items that will make an already-good system even better. The critical issues are minor and easy to fix.

---

*Audit completed: February 1, 2026*
*Auditor: Claude (Sonnet 4.5)*
*Previous audit: January 31, 2026*
