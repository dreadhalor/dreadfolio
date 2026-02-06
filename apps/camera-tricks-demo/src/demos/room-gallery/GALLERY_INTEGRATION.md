# Gallery Integration Guide

This guide explains how iframed apps (like the homepage) can interact with the 3D gallery.

## Navigation from Homepage to Other Apps

The homepage can request the gallery to navigate to other app rooms without forcing them to open. This provides a smooth, non-disorienting experience where users maintain control.

### Usage

```typescript
// In your homepage component
import { navigateToApp } from './utils/galleryNavigation';

function AppShowcase() {
  return (
    <button onClick={() => navigateToApp('hermitcraft-horns')}>
      View Hermitcraft Horns
    </button>
  );
}
```

### What Happens

1. **Current app minimizes** (if any app is open)
2. **Camera smoothly navigates** to the target room
3. **Stops without opening** - User sees the portal and can:
   - Click to open the app
   - Navigate to other rooms
   - Return to homepage with `Home` key

### Available Functions

#### `navigateToApp(appId: string)`

Navigate to a specific app's room.

```typescript
navigateToApp('hermitcraft-horns'); // Navigate to Hermitcraft Horns
navigateToApp('dredged-up');        // Navigate to DredgedUp
navigateToApp('home');              // Return to homepage
```

**Valid App IDs:**
- `home` - Homepage
- `hermitcraft-horns` - Hermitcraft Horns
- `enlight` - Enlight
- `dredged-up` - DredgedUp
- `minesweeper` - Minesweeper
- `root-beer-reviews` - Root Beer Reviews
- `pathfinder-visualizer` - Pathfinder Visualizer
- `ascii-video` - ASCII Video
- `shareme` - ShareMe
- `fallcrate` - Fallcrate
- `dread-ui` - Dread UI
- `sketches` - Sketches
- `su-done-ku` - Su-Done-Ku
- `steering-text` - Steering Text
- `gifster` - Gifster

#### `navigateToHomepage()`

Convenience function to return to homepage.

```typescript
navigateToHomepage(); // Equivalent to navigateToApp('home')
```

#### `isInGallery()`

Check if your app is running inside the gallery (vs standalone).

```typescript
if (isInGallery()) {
  // Show "View in Gallery" links
} else {
  // Show different UI for standalone mode
}
```

### User Experience

**Design Philosophy:**
- ✅ User maintains control (portal doesn't auto-open)
- ✅ Smooth camera transitions (not jarring)
- ✅ Spatial awareness preserved (can see where they're going)
- ✅ Easy return to homepage (`Home` key, minimap, or arrows)

**Return to Homepage:**
Users can return via:
1. **Home key** - Instant jump to homepage
2. **Arrow keys** - Navigate left through rooms
3. **Minimap** - Click homepage card at bottom
4. **Programmatic** - `navigateToHomepage()` from your app

### Example: Homepage App Cards

```tsx
import { navigateToApp, isInGallery } from './utils/galleryNavigation';

function ProjectCard({ appId, name, description }) {
  const inGallery = isInGallery();

  const handleClick = () => {
    if (inGallery) {
      // In gallery: Navigate to the room
      navigateToApp(appId);
    } else {
      // Standalone: Open in new tab
      window.open(`/apps/${appId}`, '_blank');
    }
  };

  return (
    <div onClick={handleClick}>
      <h3>{name}</h3>
      <p>{description}</p>
      <button>
        {inGallery ? 'View in Gallery' : 'Open App'}
      </button>
    </div>
  );
}
```

## Technical Details

### PostMessage API

Under the hood, `navigateToApp` uses the `postMessage` API:

```typescript
window.parent.postMessage({
  type: 'NAVIGATE_TO_APP',
  appId: 'hermitcraft-horns'
}, '*');
```

The gallery listens for these messages and handles navigation gracefully.

### Security

- Messages are validated by the gallery
- Unknown app IDs are logged and ignored
- No direct DOM manipulation or state access
- Safe cross-origin communication

### Fallback Behavior

If not in gallery context (e.g., running standalone):
- `navigateToApp` logs a warning and does nothing
- `isInGallery` returns `false`
- Apps should handle both contexts gracefully

## Best Practices

1. **Don't auto-navigate on load** - Let users initiate navigation
2. **Provide context** - Show what the navigation will do
3. **Support both modes** - Gallery and standalone
4. **Test both contexts** - Ensure graceful fallbacks
5. **Use semantic app IDs** - They match the URL slugs

## Troubleshooting

**Navigation not working?**
- Check app ID spelling (must match exactly)
- Verify you're in an iframe (`isInGallery()` returns true)
- Check browser console for warnings

**Want to open app automatically?**
- Don't! User control is a key UX principle
- Let them click the portal after navigation

**Need custom transitions?**
- Not currently supported
- Camera uses standard smooth lerp animation
- Timing is optimized for all scenarios
