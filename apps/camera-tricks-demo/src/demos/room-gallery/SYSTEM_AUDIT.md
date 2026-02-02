# Room Gallery System Audit - January 31, 2026

## 🎯 Executive Summary

The room gallery demo is a sophisticated 3D navigation system featuring:
- **15 cameras** navigating a gallery of portfolio apps via **split-viewport rendering**
- **Portal-based app switching** with smooth camera dolly-in effect
- **Smart app state management** (minimize/restore without reloading)
- **Live iframe rendering** through WebGL canvas "punch-through" effect
- **Screenshot dissolve transitions** during minimize/restore

**Overall Health: ✅ Good** - System is functional with solid architecture. Found 1 critical bug and several optimization opportunities.

---

## 🔴 Critical Issues

### 1. **Sign Inconsistency in Snap-to-Final Logic** (Priority: CRITICAL)

**Location:** `SplitCameraRenderer.tsx:641-642`

**Problem:**
The final snap logic uses opposite signs from the working animation loop:

```typescript
// Lines 599 & 607 (WORKING - in animation loop):
camera.position.z = camera.userData.originalZ - dollyForward;
portalGroup.position.z = PORTAL_DEFAULT_Z + dollyForward;

// Lines 641 & 642 (BROKEN - in snap-to-final):
camera.position.z = camera.userData.originalZ + finalDollyForward;  // ❌ Wrong sign
portalGroup.position.z = PORTAL_DEFAULT_Z - finalDollyForward;     // ❌ Wrong sign
```

**Impact:**
When animation completes, camera/portal may snap to incorrect positions, causing visual glitch.

**Fix:**
```typescript
// Snap camera and portal to final positions
const finalDollyForward = Math.abs(PORTAL_DEFAULT_Z) - Math.abs(zoomState.targetZ);
camera.position.z = camera.userData.originalZ - finalDollyForward;  // ✅ Match line 599
portalGroup.position.z = PORTAL_DEFAULT_Z + finalDollyForward;      // ✅ Match line 607
```

---

## 🟡 High Priority Issues

### 2. **Camera.userData.originalZ Never Cleared** (Priority: HIGH)

**Location:** `SplitCameraRenderer.tsx:586-588`

**Problem:**
`camera.userData.originalZ` is set on first animation frame but never cleared. If camera's world position changes during drag (e.g., switching rooms), the stored `originalZ` becomes stale.

**Impact:**
- Portal may not return to correct world position after minimize
- Camera dolly math breaks if user drags while app is minimizing

**Current Code:**
```typescript
if (camera.userData.originalZ === undefined) {
  camera.userData.originalZ = camera.position.z;
}
```

**Fix Options:**
1. **Clear on animation start/end:**
   ```typescript
   // When zoom starts:
   camera.userData.originalZ = camera.position.z;
   
   // When zoom completes (line 645):
   if (Math.abs(zoomState.targetZ - PORTAL_DEFAULT_Z) < 0.01) {
     camera.position.z = camera.userData.originalZ;
     portalGroup.position.z = PORTAL_DEFAULT_Z;
     delete camera.userData.originalZ; // ✅ Clear stale value
   }
   ```

2. **Recalculate every frame (simpler, safer):**
   ```typescript
   // Always use current position, don't cache
   const originalZ = camera.position.z - (Math.abs(PORTAL_DEFAULT_Z) - Math.abs(zoomState.currentZ));
   ```

**Recommendation:** Use Option 2 for robustness.

---

### 3. **No Horizontal Synchronization Safety Check** (Priority: HIGH)

**Location:** `SplitCameraRenderer.tsx:479-485`

**Problem:**
Camera positions are updated every frame in a separate loop *after* the dolly-in animation. If timing is off, portal may drift left/right relative to camera.

**Current Code:**
```typescript
// Line 579-607: Dolly animation (modifies camera.position.z)
// Line 479-485: Camera X position update (happens AFTER dolly in same frame)
for (let i = 0; i < cameras.length; i++) {
  cameras[i].position.x = calculateCameraPosition(i, currentProgress, CAMERA_SPACING);
}
```

**Risk:**
If `camera.position` is modified elsewhere or if execution order changes, portals could desync horizontally.

**Fix:**
Add validation after position updates:
```typescript
// After camera position updates
if (DEBUG && camera.userData.originalZ !== undefined) {
  const expectedWorldZ = camera.position.z + portalGroup.position.z;
  const targetWorldZ = camera.userData.originalZ + PORTAL_DEFAULT_Z;
  if (Math.abs(expectedWorldZ - targetWorldZ) > 0.1) {
    console.warn(`Portal ${i} world position drift detected!`, {
      expected: targetWorldZ,
      actual: expectedWorldZ,
      drift: expectedWorldZ - targetWorldZ
    });
  }
}
```

---

### 4. **Screenshot Overlay objectFit Mismatch** (Priority: MEDIUM-HIGH)

**Location:** `PortalScreenshotOverlay.tsx:39`

**Problem:**
Uses `objectFit: 'contain'` which preserves aspect ratio but may leave gaps. Portal screenshots use `cover` during initial display.

**Current:**
```typescript
objectFit: 'contain', // Show full image without cropping
```

**Impact:**
Screenshot may not perfectly fill portal during minimize, revealing canvas behind it.

**Fix:**
```typescript
objectFit: 'cover', // Match portal screenshot display mode
```

---

## 🟢 Medium Priority Issues

### 5. **Magic Number in Portal World Z Calculation** (Priority: MEDIUM)

**Location:** `SplitCameraRenderer.tsx:591-596`

**Problem:**
Comments reference specific hardcoded values (5, 0.8, 4.2) instead of using constants.

**Current:**
```typescript
const defaultDistance = Math.abs(PORTAL_DEFAULT_Z); // 5 units
const currentDistance = Math.abs(zoomState.currentZ); // Current distance (5 → 0.8)
const dollyForward = defaultDistance - currentDistance; // How far to move forward (0 → 4.2)
```

**Fix:**
Update comments to be more generic:
```typescript
const defaultDistance = Math.abs(PORTAL_DEFAULT_Z); // Starting distance
const currentDistance = Math.abs(zoomState.currentZ); // Current distance during lerp
const dollyForward = defaultDistance - currentDistance; // Camera movement offset
```

---

### 6. **Duplicate Distance Calculation During Minimize** (Priority: MEDIUM)

**Location:** `SplitCameraRenderer.tsx:531-532 & 536-537`

**Problem:**
Distance calculations are duplicated between zoom progress calculation and projection update.

**Current:**
```typescript
const currentDistance = Math.abs(activeCamera.portalZoomState.currentZ);
const closeDistance = Math.abs(PORTAL_ZOOM_TARGET_Z);
const farDistance = Math.abs(PORTAL_DEFAULT_Z);
const distanceProgress = (currentDistance - closeDistance) / (farDistance - closeDistance);
```

**Fix:**
Extract to utility function in `portalProjection.ts`:
```typescript
export function calculateMinimizeProgress(currentZ: number): number {
  const currentDistance = Math.abs(currentZ);
  const closeDistance = Math.abs(PORTAL_ZOOM_TARGET_Z);
  const farDistance = Math.abs(PORTAL_DEFAULT_Z);
  return (currentDistance - closeDistance) / (farDistance - closeDistance);
}
```

---

### 7. **No Error Boundary Around Portal Projection** (Priority: MEDIUM)

**Location:** `SplitCameraRenderer.tsx:518-522`

**Problem:**
`calculatePortalScreenProjection` can throw if portal/camera is disposed mid-frame, but there's no error handling.

**Fix:**
```typescript
try {
  const projection = calculatePortalScreenProjection(
    activeCamera.portalGroup,
    activeCamera,
    gl.domElement
  );
  // ... use projection
} catch (error) {
  console.error('Portal projection failed:', error);
  // Gracefully skip this frame's screenshot update
  continue;
}
```

---

## 🔵 Low Priority / Polish

### 8. **Hardcoded Z-Index Values** (Priority: LOW)

**Location:** Multiple files

**Problem:**
Z-index values scattered across components:
- `AppLoader.tsx`: iframe uses `1`, `500`, `1000`, `1001`, `-999`
- `PortalScreenshotOverlay.tsx`: uses `5`

**Fix:**
Create `constants.ts` entry:
```typescript
export const Z_INDEX = {
  IFRAME_BACKGROUND: 1,
  SCREENSHOT_OVERLAY: 5,
  CANVAS: 10,
  IFRAME_TRANSITIONING: 500,
  BLACK_OVERLAY: 999,
  IFRAME_ACTIVE: 1000,
  MINIMIZE_BUTTON: 1001,
  IFRAME_HIDDEN: -999,
} as const;
```

---

### 9. **Inconsistent Naming: "Dolly Forward" vs Z Axis Direction** (Priority: LOW)

**Location:** `SplitCameraRenderer.tsx:596`

**Problem:**
Variable is named `dollyForward` but code subtracts it from camera Z, suggesting it's actually "backward" in the coordinate system.

**Explanation:**
In Three.js, camera's -Z axis points forward. So "dolly forward" means *decreasing* `camera.position.z`.

**Recommendation:**
Rename for clarity:
```typescript
const dollyAmount = defaultDistance - currentDistance; // Amount to dolly (direction handled by sign)
camera.position.z = camera.userData.originalZ - dollyAmount; // Move in -Z direction (forward)
```

---

### 10. **Missing JSDoc for Key Mathematical Functions** (Priority: LOW)

**Location:** `SplitCameraRenderer.tsx:590-607`

**Problem:**
Complex mathematical compensation logic lacks comprehensive documentation.

**Fix:**
```typescript
/**
 * Camera dolly-in with portal world position compensation
 * 
 * GOAL: Camera moves forward, portal stays at fixed world position
 * 
 * MATH:
 *   Portal World Z = Camera World Z + Portal Local Z
 *   Target: Portal World Z = originalZ + PORTAL_DEFAULT_Z (constant)
 * 
 * SOLUTION:
 *   1. Calculate dolly amount: dollyForward = defaultDistance - currentDistance
 *   2. Move camera: camera.z = originalZ - dollyForward (forward in -Z)
 *   3. Compensate portal: portal.z = PORTAL_DEFAULT_Z + dollyForward
 * 
 * RESULT: Portal world position remains constant!
 */
```

---

## ✅ Strengths

### Architecture
- ✅ **Clean separation:** Camera, portal, state management are well-isolated
- ✅ **Type safety:** `ExtendedCamera` interface properly types runtime properties
- ✅ **Ref management:** `usePortalRefs` hook eliminates global window pollution
- ✅ **Safe timeouts:** `useSafeTimeout` prevents memory leaks

### Performance
- ✅ **Direct DOM manipulation:** Bypasses React for 60fps iframe/screenshot updates
- ✅ **Efficient rendering:** Only visible portals animate (breathing, rotation)
- ✅ **Smart cleanup:** Cameras and portals properly disposed on unmount

### User Experience
- ✅ **Smart app persistence:** Minimized apps stay loaded, instant restore
- ✅ **Smooth animations:** LERP-based movement feels natural
- ✅ **Visual polish:** Screenshot dissolve effect is elegant

---

## 📊 Performance Metrics

**Current State:**
- Target: 60 FPS
- Portal count: 15
- Active animations: 2-3 (portal zoom, screenshot fade, portal breathing)

**Optimization Opportunities:**
1. Use `THREE.InstancedMesh` for portal rings (15x draw call reduction)
2. Implement portal LOD (lower quality when far from camera)
3. Lazy-load room decorations (only create when visible)

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Bug Fix (5 minutes)
1. Fix snap-to-final sign inconsistency (Issue #1)

### Phase 2: High Priority (20 minutes)
2. Implement safer `originalZ` calculation (Issue #2)
3. Add horizontal sync validation (Issue #3)
4. Fix screenshot objectFit (Issue #4)

### Phase 3: Polish (30 minutes)
5. Extract minimize progress utility (Issue #6)
6. Add error handling to projection (Issue #7)
7. Improve documentation (Issue #10)

### Phase 4: Future Optimization (optional)
8. Centralize z-index constants (Issue #8)
9. Consider instanced rendering for portals

---

## 📝 Testing Checklist

When implementing fixes, verify:

- [ ] Portal zoom-in completes at correct position
- [ ] Portal zoom-out returns to exact default position
- [ ] Camera dolly works correctly when user drags mid-animation
- [ ] Screenshot overlay perfectly covers portal during minimize
- [ ] No visual glitches at animation boundaries
- [ ] No console errors during rapid app switching
- [ ] FPS stays above 55 during all animations
- [ ] Portal horizontal position never drifts

---

## 🏆 Conclusion

The room gallery system is **well-architected** with solid separation of concerns and good performance. The camera dolly-in implementation is mathematically sound, just needs the critical sign bug fixed.

**Grade: A-** (Would be A+ after critical fixes)

**Biggest Win:** The mathematical compensation approach for camera dolly-in is elegant and maintains perfect portal world positioning. 🎉

**Biggest Risk:** Stale `originalZ` value if user drags during animations (Issue #2).

---

*Audit completed: January 31, 2026*
*Auditor: Claude (Sonnet 4.5)*
