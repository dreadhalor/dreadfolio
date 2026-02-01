# Camera Safe Zones for Room Decoration Placement

## Camera Specifications
- **Position**: `(x, 3, 10)` where x varies per camera
- **Height (Y)**: 3 units (low angle for dramatic perspective)  
- **Depth (Z)**: 10 units into the room
- **FOV**: 85° (very wide angle)

## Room Dimensions
- **Width (X)**: 30 units (-15 to +15 from center)
- **Height (Y)**: 12 units (0 to 12)
- **Depth (Z)**: 30 units (-15 to +15 from center)

## Safe Placement Zones

### ✅ SAFE - In Front of Camera (Visible & Clear)
- **Z range**: `-15 to 7`
- **Why**: Camera can see these clearly without collision
- **Best for**: Main decorations, furniture, focal points

### ⚠️ CAUTION - Camera Eye Level
- **Y range**: `2 to 4` 
- **Why**: Objects at camera height can obstruct view
- **Best for**: Floor items (Y < 2) or ceiling items (Y > 5)

### ❌ DANGER - Camera Collision Zone
- **Z range**: `8 to 12`
- **Why**: Camera is at Z=10, objects here will clip through view
- **Action**: MOVE to back wall (Z < -10) or in front (Z < 7)

### ❌ DANGER - Behind Camera (Invisible)
- **Z range**: `> 12`
- **Why**: Camera can't see behind itself
- **Action**: Move to front or sides

## Optimal Placement Guidelines

1. **Focal Points**: Z = -5 to 0 (centered, back half)
2. **Furniture**: Z = -8 to 5 (spread throughout)
3. **Wall Decorations**: 
   - Back wall: Z = -14 to -12
   - Side walls: X = ±14, any Z
4. **Ceiling Items**: Y = 8 to 11, any safe Z
5. **Floor Items**: Y = 0 to 1, any safe Z

## Common Fixes

### Front Wall Decorations (WRONG)
```typescript
// ❌ BAD: Too close to camera
position={[offsetX, 2, 9.8]}

// ✅ GOOD: Move to back wall
position={[offsetX, 2, -14]}

// ✅ GOOD: Move to side wall  
position={[offsetX + 14, 2, 0]}
```

### Objects Behind Camera (WRONG)
```typescript
// ❌ BAD: Behind camera
position={[offsetX, 2, 13]}

// ✅ GOOD: In front
position={[offsetX, 2, -5]}
```
