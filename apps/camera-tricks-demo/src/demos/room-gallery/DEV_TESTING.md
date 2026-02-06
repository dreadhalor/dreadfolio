# Development Testing Guide

## Testing Cross-Origin Navigation Locally

To test the postMessage integration between homepage and gallery:

### Step 1: Run Both Dev Servers

```bash
# Terminal 1 - Run homepage
cd apps/home-page
pnpm dev
# Homepage will start on http://localhost:5173 (or similar)

# Terminal 2 - Run gallery (camera-tricks-demo)
cd apps/camera-tricks-demo  
pnpm dev
# Gallery will start on http://localhost:5174 (or similar)
```

### Step 2: Update Gallery Config for Local Testing

Temporarily modify `apps/camera-tricks-demo/src/demos/room-gallery/config/apps.ts`:

```typescript
{
  id: 'home',
  name: 'Homepage',
  color: '#303030',
  description: "Scott Hetrick's official portfolio homepage.",
  url: 'http://localhost:5173', // <-- Point to local homepage dev server
  imageUrl: HomepageImg,
},
```

### Step 3: Add Navigation Test to Homepage

In `apps/home-page/src/App.tsx` (or wherever appropriate), add a test button:

```tsx
import { navigateToApp } from '../camera-tricks-demo/src/demos/room-gallery/utils/galleryNavigation';

function App() {
  return (
    <div>
      {/* Your existing homepage content */}
      
      {/* Test navigation */}
      <button 
        onClick={() => navigateToApp('hermitcraft-horns')}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          background: '#6b9fff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Test: Navigate to Hermitcraft Horns
      </button>
    </div>
  );
}
```

### Step 4: Test the Flow

1. Open gallery: `http://localhost:5174` (or whatever port)
2. Gallery loads homepage in iframe from `http://localhost:5173`
3. Click the test button in homepage
4. Gallery should:
   - Minimize homepage (if it was opened)
   - Navigate camera to Hermitcraft Horns room
   - Stop there without opening the portal

### Step 5: Check Browser Console

You should see logs like:
```
[Gallery Nav] Requested navigation to: hermitcraft-horns (from homepage)
[CrossOriginNav] Navigating to hermitcraft-horns (room 1) (from gallery)
```

### Troubleshooting

**Homepage not loading in gallery?**
- Check CORS settings in Vite config
- Verify ports in gallery config match running servers

**PostMessage not working?**
- Check browser console for errors
- Verify both servers are running
- Try opening browser dev tools Network tab

**Gallery not responding?**
- Check `useCrossOriginNavigation` is imported in index.tsx
- Verify app ID matches exactly (case-sensitive)

### Production Build Testing

To test with production builds:

```bash
# Build both apps
cd apps/home-page && pnpm build
cd ../camera-tricks-demo && pnpm build

# Serve them
cd apps/home-page && pnpm preview  # Port 4173
cd ../camera-tricks-demo && pnpm preview  # Port 4174
```

Update gallery config URLs accordingly.

### Alternative: Quick Test with Browser Console

You can test postMessage directly from browser console when gallery is open:

```javascript
// Simulate homepage sending navigation message
window.postMessage({
  type: 'NAVIGATE_TO_APP',
  appId: 'hermitcraft-horns'
}, '*');
```

This should trigger navigation even without the homepage running!
