# Camera Tricks & Optical Illusions Demo

An interactive showcase of 7 different optical illusion and camera trick techniques for creating visually stunning portfolio experiences.

## 🎨 Demos Included

### 1. Parallax Depth Layers
Five independent layers moving at different speeds create a dramatic 3D depth illusion.
- **Interaction**: Move your mouse to see the effect
- **Tech**: Pure CSS transforms, no WebGL required
- **Best for**: Elegant, subtle depth without complexity

### 2. Impossible Geometry (Escher-style)
Cards arranged on isometric cubes in impossible configurations.
- **Interaction**: Drag to rotate the structure
- **Tech**: CSS 3D transforms, perspective
- **Best for**: Mind-bending, artistic portfolios

### 3. Infinite Zoom (Droste Effect)
Recursive zooming that reveals cards nested inside cards infinitely.
- **Interaction**: Click any card to zoom deeper
- **Tech**: Framer Motion animations, recursive rendering
- **Best for**: Exploring hierarchical content

### 4. Rotating Cylinder (Zoetrope)
Cards arranged on the inside of a spinning cylinder with momentum physics.
- **Interaction**: Drag horizontally to rotate, vertically to tilt
- **Tech**: Trigonometry, CSS 3D transforms, momentum
- **Best for**: Browsing many items in circular space

### 5. Forced Perspective Hallway
Cards recede toward a vanishing point with perspective warping and depth fog.
- **Interaction**: Scroll to move through the hallway
- **Tech**: CSS perspective, calculated scaling
- **Best for**: Dramatic depth, narrative progression

### 6. Tilt-Shift Miniature
Miniature diorama effect with selective focus and high saturation.
- **Interaction**: Move mouse to adjust focus plane
- **Tech**: Backdrop filters, 3D city layout, camera orbit
- **Best for**: Playful, toy-like aesthetic

### 7. Kaleidoscope Mirror
Symmetrical reflections creating mesmerizing patterns.
- **Interaction**: Drag to rotate, click segments to focus
- **Tech**: CSS clip-path, radial symmetry, animated patterns
- **Best for**: Artistic, psychedelic experiences

## 🚀 Getting Started

### Installation

```bash
cd apps/camera-tricks-demo
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

### Keyboard Shortcuts

Press number keys `1-7` to quickly switch between demos:
- `1` - Parallax Depth
- `2` - Impossible Geometry
- `3` - Infinite Zoom
- `4` - Rotating Cylinder
- `5` - Forced Perspective
- `6` - Tilt-Shift
- `7` - Kaleidoscope

## 🏗️ Architecture

```
src/
├── app.tsx                    # Main app with keyboard shortcuts
├── main.tsx                   # Entry point
├── index.css                  # Global styles
├── components/
│   ├── demo-navigation.tsx    # Top navigation bar
│   ├── demo-container.tsx     # Demo renderer/router
│   └── mock-app-card.tsx      # Reusable card component
├── demos/
│   ├── parallax-depth.tsx
│   ├── impossible-geometry.tsx
│   ├── infinite-zoom.tsx
│   ├── rotating-cylinder.tsx
│   ├── forced-perspective.tsx
│   ├── tilt-shift.tsx
│   └── kaleidoscope.tsx
└── utils/
    └── demo-data.ts           # Mock app data
```

## 🎯 Next Steps

After choosing your favorite technique:

1. **Extract the code** - Copy the demo implementation you like
2. **Integrate** - Add to your portfolio app
3. **Customize** - Replace mock cards with real app data
4. **Polish** - Add loading states, error handling, mobile optimization
5. **Test** - Verify performance on various devices

## 🔧 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Fast build tool
- **Framer Motion** - Smooth animations (zoom demo)
- **clsx** - Conditional styling
- **Pure CSS** - Most effects use only CSS transforms

## 💡 Design Philosophy

Each demo is designed to be:
- **Interactive** - Responds to mouse, drag, scroll, or click
- **Performant** - Uses GPU-accelerated transforms
- **Self-contained** - Can be copied independently
- **Well-documented** - Clear code with comments
- **Responsive** - Works on various screen sizes

## 🎨 Visual Design

- Dark backgrounds to make illusions pop
- Vibrant gradient cards (cyan/purple/pink)
- Smooth 300-600ms animations
- Minimal UI chrome to focus on the effect
- Consistent emoji-based app icons

## 📝 Notes

- All effects are implemented in vanilla React + CSS (except zoom uses Framer Motion)
- No heavy dependencies like Three.js or WebGL
- Performance-first with `will-change` hints and `transform` usage
- Mobile-friendly (though some effects work best on desktop)

## 🚧 Future Enhancements

Potential improvements you could add:
- Mobile touch gesture support
- WebGL shaders for more complex effects
- Music/sound effects synchronized to animations
- VR/AR camera tracking
- Screenshot/recording functionality
- Social sharing of favorite configurations

---

**Built for exploring portfolio site design concepts**
