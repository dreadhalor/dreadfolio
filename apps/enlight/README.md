# Enlight

**Interactive canvas-based light and shadow visualization**

![Enlight Demo](https://via.placeholder.com/800x400?text=Enlight+Interactive+Demo)

[View Live Demo](https://scottjhetrick.com/enlight/)

Enlight is an interactive visualization demonstrating ray casting, light propagation, and dynamic shadows in real-time. Built with vanilla TypeScript and HTML5 Canvas, it showcases computational geometry algorithms and provides an engaging, tactile exploration of light physics.

---

## ✨ Features

- **🎨 Interactive Canvas**: Create, move, and resize polygons with intuitive mouse/touch controls
- **💡 Real-time Ray Casting**: Watch light rays interact with shapes dynamically
- **🌑 Dynamic Shadows**: Realistic shadow generation based on polygon positions
- **🖱️ Custom Cursor**: Beautiful custom cursor that follows your mouse with light effects
- **📐 Polygon Manipulation**: 
  - Double-click to create random polygons
  - Drag to move shapes
  - Resize by dragging corners
  - Delete with double-click on shape
- **📱 Responsive Design**: Adapts to any screen size with automatic canvas resizing
- **⚡ Performance Optimized**: Efficient rendering with only necessary updates
- **🎯 Precise Geometry**: Sophisticated algorithms for point-in-polygon tests and subdivisions

---

## 🛠️ Tech Stack

- **Language**: TypeScript
- **Rendering**: HTML5 Canvas API
- **Build Tool**: Vite 5
- **Geometry**: Custom computational geometry algorithms
- **Font Loading**: fontfaceobserver-es
- **Linting**: ESLint with TypeScript support

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.1

### Installation

```bash
# From the monorepo root
cd apps/enlight

# Install dependencies (or from root: pnpm install)
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173/enlight/`

---

## 📦 Available Scripts

```bash
# Development
pnpm dev          # Start dev server with hot reload
pnpm dev-host     # Start dev server with network access

# Building
pnpm build        # Build for production

# Linting
pnpm lint         # Run ESLint checks

# Preview
pnpm preview      # Preview production build locally
```

---

## 🏗️ Project Structure

```
enlight/
├── src/
│   ├── classes/
│   │   └── Polygon.ts           # Polygon class and factory functions
│   ├── draw.ts                  # Main drawing and rendering logic
│   ├── draw-steps.ts            # Step-by-step drawing utilities
│   ├── interfaces.ts            # TypeScript interfaces (Point, Segment, etc.)
│   ├── line-utils.ts            # Geometry utilities (ray casting, intersections)
│   ├── main.ts                  # Application entry point and event handling
│   ├── polygons.ts              # Polygon data and presets
│   ├── utils.ts                 # General utility functions
│   └── style.css                # Global styles
├── public/
│   ├── AiFillQuestionCircle.svg        # Help icon (idle state)
│   └── AiFillQuestionCircleMouseover.svg  # Help icon (hover state)
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## 🎮 How to Use

### Creating Shapes
1. **Double-click** anywhere on the canvas to create a random polygon
2. Polygons appear with varying sizes and shapes

### Manipulating Shapes
1. **Click** on a shape to select it (highlighted)
2. **Drag** a selected shape to move it
3. **Drag corners** to resize the shape
4. **Double-click** on a shape to delete it
5. **Click** on empty canvas to deselect

### Interacting with Light
- Move your cursor around to see light rays emanating from your position
- Watch how rays interact with polygon edges
- Observe dynamic shadow generation in real-time
- Notice the subtle blur/glow effects around the light source

### Getting Help
- Click the **?** icon (top-right corner) to view instructions
- Click anywhere to close the help panel

---

## 🧮 Technical Highlights

### Computational Geometry
- **Ray Casting Algorithm**: Efficient ray-polygon intersection detection
- **Point-in-Polygon Tests**: Determines if cursor is inside shapes
- **Line Subdivision**: Smooth curves through recursive subdivision
- **Area Calculations**: Accurate polygon area computation using shoelace formula

### Rendering Techniques
- **Dual Canvas System**: Separate canvases for main scene and cursor
- **Selective Updates**: Only redraws when necessary for performance
- **Gradient Rendering**: Beautiful radial gradients for light effects
- **Custom Cursor**: Canvas-based cursor with light glow

### State Management
- **FSM Pattern**: Finite state machine for tutorial progression
- **Event-Driven**: Efficient event handling for mouse/touch input
- **Responsive Updates**: Dynamic canvas resizing on window resize

---

## 🔧 Configuration

### Canvas Settings
Modify constants in `main.ts`:
```typescript
const mouse_radius = 11;        // Size of light source
const point_radius = 20;        // Hit detection radius for corners
const clickRadius = 15;         // Double-click detection radius
const dblClickTime = 500;       // Double-click timing (ms)
```

### Visual Effects
Modify in `draw.ts`:
```typescript
export const fuzzyRadius = 80;  // Size of light glow effect
```

---

## 🚀 Deployment

Enlight is deployed as part of the dreadfolio monorepo:

```bash
# Build for production
pnpm build

# Output will be in dist/ directory
# Ready to deploy to any static hosting
```

The app is configured with `base: '/enlight/'` for deployment to a subdirectory.

---

## 🎓 Learning Opportunities

This project demonstrates:

1. **Canvas API Mastery**: Advanced 2D rendering techniques
2. **Computational Geometry**: Ray casting, intersections, point-in-polygon
3. **Performance Optimization**: Selective rendering, efficient algorithms
4. **Event Handling**: Mouse/touch events, double-click detection
5. **TypeScript Best Practices**: Strong typing, interfaces, classes
6. **State Management**: FSM pattern for UI states
7. **Responsive Design**: Dynamic canvas sizing and adaptation

---

## 🐛 Known Limitations

- **Touch Support**: Basic touch support implemented, but optimized for mouse
- **Mobile Performance**: May be slower on older mobile devices
- **Browser Compatibility**: Requires modern browser with Canvas API support
- **Polygon Complexity**: Very complex polygons (1000+ points) may impact performance

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Multiple light sources
- [ ] Color customization for lights and shadows
- [ ] Shape library (triangles, stars, hexagons)
- [ ] Animation presets
- [ ] Save/load polygon configurations
- [ ] Export canvas as image
- [ ] Performance mode toggle
- [ ] Accessibility improvements (keyboard controls)

### Technical Improvements
- [ ] Web Workers for geometry calculations
- [ ] WebGL renderer for better performance
- [ ] Spatial partitioning (quadtree) for collision detection
- [ ] Undo/redo functionality
- [ ] Unit tests for geometry utilities

---

## 📝 License

MIT License - See root LICENSE file for details

---

## 👤 Author

**Scott Hetrick**
- Portfolio: [scottjhetrick.com](https://scottjhetrick.com)
- GitHub: [@Dreadhalor](https://github.com/Dreadhalor)

---

## 🙏 Acknowledgments

- Inspired by classic ray casting demos and light physics simulations
- Built as part of the learning journey documented in the [dreadfolio monorepo](https://github.com/Dreadhalor/dreadfolio)
- Font: "Annie Use Your Telescope" from Google Fonts

---

**Enjoy exploring the interplay of light and shadow! ✨**
