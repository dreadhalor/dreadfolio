# Steering Text

**Interactive text animation using p5.js steering behaviors and particle systems**

[View Live Demo](https://scottjhetrick.com/steering-text/)

Steering Text is a mesmerizing interactive animation where text is composed of autonomous particles that respond to user input. Each letter is formed by hundreds of vehicles using flocking and steering behaviors, creating fluid, organic text animations.

---

## ✨ Features

- **🎨 Particle-Based Text**: Text formed by autonomous vehicles with steering behaviors
- **🖱️ Mouse Interaction**: Click and drag to attract particles to your cursor
- **⌨️ Live Text Input**: Type to dynamically change the displayed text
- **💥 Explode Effect**: Click particles to scatter them dramatically
- **🌊 Flocking Behavior**: Particles use separation, cohesion, and alignment
- **🎯 Target Seeking**: Each particle knows its home position and steers toward it
- **📱 Responsive**: Adapts to any screen size with dynamic text scaling
- **⚡ Smooth Animation**: 60fps p5.js rendering with optimized particle systems

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Graphics**: p5.js (creative coding library)
- **Build Tool**: Vite 5
- **Bundler Plugin**: @vitejs/plugin-react-swc (fast refresh)
- **Font**: Avenir Next LT Pro Demi
- **Linting**: ESLint with TypeScript support

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.1

### Installation

```bash
# From the monorepo root
cd apps/steering-text

# Install dependencies (or from root: pnpm install)
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173/steering-text/`

---

## 📦 Available Scripts

```bash
# Development
pnpm dev          # Start dev server with hot reload

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
steering-text/
├── src/
│   ├── assets/
│   │   └── AvenirNextLTPro-Demi.otf  # Custom font file
│   ├── app.tsx                       # React wrapper component
│   ├── main.tsx                      # Application entry point
│   ├── sketch.ts                     # p5.js sketch and interaction logic
│   ├── vehicle.ts                    # Vehicle class with steering behaviors
│   └── index.css                     # Global styles
├── public/
│   └── vite.svg                      # Favicon
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## 🎮 How to Use

### Interactive Tutorial

The app guides you through interactions step-by-step:

1. **"hover"** - Initial state. Move your mouse over the particles to scatter them
2. **"press"** - After enough interactions, text changes. Click and hold to attract particles
3. **"space"** - Release click. Press spacebar to explode all particles
4. **"type"** - After spacebar. Start typing to create custom text!

### Controls

- **Mouse hover**: Particles flee from cursor
- **Click + drag**: Attract particles to cursor position
- **Release**: Particles return to home positions (with explosion effect if near cursor)
- **Spacebar**: Explode all particles randomly
- **Type any text**: Dynamically morphs particles into new text
- **Backspace**: Remove last character

---

## 🧮 Technical Highlights

### Steering Behaviors

Each particle is an autonomous "vehicle" with:

- **Position & Velocity**: Current state and movement
- **Home & Target**: Where it belongs and where it's going
- **Steering Force**: Smooth interpolation toward target
- **Maximum Speed & Force**: Physics constraints
- **Alpha/Opacity**: Fade in/out effects

### Particle System

- **Text to Points**: Font converted to particle positions using p5.js `textToPoints()`
- **Dynamic Spawning**: Particles appear/disappear as text changes
- **Exiting Animation**: Excess particles fade out smoothly
- **State Machine**: Each vehicle tracks its behavior state (default, exiting, scattered)

### Performance Optimizations

- **Efficient Rendering**: Direct p5.js canvas rendering
- **Particle Pooling**: Reuses vehicle objects when text changes
- **Minimal DOM**: Single canvas element
- **60fps Target**: Optimized for smooth animation

---

## 🎨 Customization

### Modify Text Properties

In `sketch.ts`:

```typescript
const textSize = Math.min(p5.windowWidth / 3, 300);
const fillColor = [255, 255, 255];  // White particles
const backgroundColor = [0, 0, 0];   // Black background
```

### Adjust Particle Behavior

In `vehicle.ts`:

```typescript
maxspeed: 10,           // Maximum velocity
maxforce: 1,            // Steering force strength
separationDistance: 25, // How far apart particles stay
```

### Change Initial Text

In `sketch.ts`:

```typescript
let text = 'hover';  // Change to any text
```

---

## 🚀 Deployment

Steering Text is deployed as part of the dreadfolio monorepo:

```bash
# Build for production
pnpm build

# Output will be in dist/ directory
# Configured for /steering-text/ subdirectory deployment
```

---

## 🎓 Learning Opportunities

This project demonstrates:

1. **p5.js Integration**: Using p5.js with React and TypeScript
2. **Steering Behaviors**: Autonomous agents with seek/flee behaviors
3. **Particle Systems**: Managing hundreds of particles efficiently
4. **Text Rendering**: Converting fonts to particle positions
5. **State Machines**: Managing interaction states and transitions
6. **Physics Simulation**: Velocity, acceleration, and forces
7. **Custom Fonts**: Loading and using custom OTF fonts in p5.js
8. **Interactive Animation**: Real-time response to user input

---

## 🧩 How It Works

### 1. Font Loading
```typescript
p5.preload = () => {
  font = p5.loadFont(_font);
};
```

### 2. Text to Particles
```typescript
const pts = font.textToPoints(text, x, y, textSize, { sampleFactor: 0.25 });
pts.forEach(pt => {
  vehicles.push(createVehicle(p5, pt.x, pt.y));
});
```

### 3. Steering Behavior
```typescript
// Each frame
vehicles.forEach(v => {
  tick(p5, v);      // Calculate steering forces
  update(v);        // Update position/velocity
  show(p5, v);      // Render particle
});
```

### 4. Interactive States
- **Hover**: Particles flee from mouse
- **Press**: Particles seek mouse position
- **Released**: Return home with explosion effect
- **Typing**: Morph into new text dynamically

---

## 📊 Bundle Analysis

- **Main bundle**: 1,183 kB (gzipped: 309 kB)
- **CSS**: 0.14 kB (minimal styling)
- **Font**: 69.94 kB (custom Avenir Next Pro)
- **Large bundle** due to p5.js library (core graphics engine)

---

## 🐛 Known Limitations

- **Performance**: Large text with many particles may slow on older devices
- **Mobile**: Touch interactions work but optimized for mouse
- **Font Loading**: Brief delay before text appears while font loads
- **Browser Compatibility**: Requires modern browser with Canvas API

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Multiple font choices
- [ ] Color palette picker
- [ ] Adjustable particle density
- [ ] Background patterns/gradients
- [ ] Save/share custom animations
- [ ] Preset text animations
- [ ] Mobile-optimized touch controls
- [ ] Audio-reactive mode

### Technical Improvements
- [ ] Web Workers for particle calculations
- [ ] WebGL renderer for more particles
- [ ] Reduced bundle size (p5.js tree-shaking)
- [ ] Particle object pooling optimization
- [ ] Smooth text morphing transitions
- [ ] Performance profiling and optimization

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

- Built with [p5.js](https://p5js.org/) - Processing for the web
- Inspired by Daniel Shiffman's Coding Train tutorials on steering behaviors
- Font: Avenir Next LT Pro Demi
- Part of the [dreadfolio monorepo](https://github.com/Dreadhalor/dreadfolio)

---

**Type, click, and watch the particles dance! ✨🎨**
