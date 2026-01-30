# Pathfinder Visualizer

**Interactive algorithm visualizer for pathfinding and maze generation**

[View Live Demo](https://scottjhetrick.com/pathfinder-visualizer/)

Pathfinder Visualizer is an interactive educational tool that brings graph algorithms to life. Watch A*, BFS, DFS, and other pathfinding algorithms find their way through mazes, and explore 7 different maze generation techniques including Kruskal's, Prim's, and Recursive Backtracking.

---

## ✨ Features

- **🔍 Pathfinding Algorithms**: Visualize A*, BFS, DFS, and more finding the shortest path
- **🏗️ Maze Generation**: 7 different maze generation algorithms to explore
- **🎨 Interactive Grid**: Draw walls, move start/end points with mouse or touch
- **⚡ Real-time Animation**: Watch algorithms explore the grid step-by-step
- **📊 Algorithm Comparison**: See how different algorithms approach the same problem
- **🎮 Interactive Controls**: Pause, speed up, or reset animations
- **📐 Responsive Grid**: Adapts to screen size for optimal viewing
- **🖱️ Intuitive UI**: Clean Material-UI interface with dropdown menus

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS, SCSS
- **UI Components**: Material-UI (@mui/material), dread-ui
- **Utilities**: Lodash, uuid
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript 5.2.2

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.1

### Installation

```bash
# From the monorepo root
cd apps/pathfinder-visualizer

# Install dependencies (or from root: pnpm install)
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173/pathfinder-visualizer/`

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
pathfinder-visualizer/
├── src/
│   ├── components/
│   │   ├── grid-square.tsx           # Individual grid cell component
│   │   ├── grid-square.scss          # Cell styling
│   │   └── top-nav.tsx               # Navigation bar with controls
│   ├── utilities/
│   │   ├── algorithm-methods.ts      # Algorithm execution logic
│   │   ├── animations.ts             # Animation definitions
│   │   ├── animator.ts               # Animation queue manager
│   │   ├── draw-wrapper.tsx          # Grid drawing utilities
│   │   ├── data-structures/
│   │   │   ├── coordinate-utils.ts   # Coordinate helper functions
│   │   │   ├── grid-adjacency-list.ts  # Graph representation
│   │   │   ├── grid-set.ts           # Coordinate set operations
│   │   │   ├── grid-union-find.ts    # Union-find for maze generation
│   │   │   └── path-list.ts          # Path tracking
│   │   ├── maze-generation/
│   │   │   ├── ellers.ts             # Eller's algorithm
│   │   │   ├── hunt-and-kill.ts      # Hunt-and-kill algorithm
│   │   │   ├── kruskals.ts           # Kruskal's algorithm
│   │   │   ├── prims.ts              # Prim's algorithm
│   │   │   ├── recursive-backtracking.ts  # Recursive backtracking
│   │   │   ├── recursive-division.ts  # Recursive division
│   │   │   └── index.ts              # Algorithm exports
│   │   ├── maze-structures.ts        # Maze utility functions
│   │   ├── randomizers.ts            # Random generation helpers
│   │   └── solvers/
│   │       ├── a-star.ts             # A* pathfinding
│   │       ├── bfs.ts                # Breadth-first search
│   │       ├── bfs-raw.ts            # Raw BFS implementation
│   │       └── dfs.ts                # Depth-first search
│   ├── types.ts                      # TypeScript type definitions
│   ├── app.tsx                       # Main application component
│   ├── app.scss                      # Global app styles
│   └── index.scss                    # Root styles
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
└── README.md
```

---

## 🎮 How to Use

### Grid Interaction

1. **Start Point** (Green): Drag to move
2. **End Point** (Red): Drag to move
3. **Drawing Walls**: Click and drag on empty cells
4. **Erasing**: Click on wall cells to remove them

### Solving the Maze

1. Select a drawing mode (Wall, Weight, etc.) from the dropdown
2. Click **"Solve It!"** and choose an algorithm:
   - **A*** - Optimal, uses heuristics (Manhattan distance)
   - **BFS** - Optimal, explores level-by-level
   - **DFS** - Not optimal, explores depth-first
3. Watch the algorithm explore the grid in real-time

### Generating Mazes

Click **"Generate Maze"** and choose an algorithm:

1. **Kruskal's Algorithm** - Randomly connects cells using union-find
2. **Prim's Algorithm** - Grows maze from random cell
3. **Recursive Backtracking** - DFS-based maze generation
4. **Recursive Division** - Divides space recursively
5. **Eller's Algorithm** - Row-by-row maze generation
6. **Hunt and Kill** - Combines random walk with systematic hunting

### Controls

- **Clear Map**: Removes all walls and weights
- **User Menu**: Access achievements and settings

---

## 🧮 Algorithms

### Pathfinding Algorithms

#### A* (A-Star)
- **Type**: Informed search
- **Optimal**: Yes
- **Heuristic**: Manhattan distance
- **Best for**: Finding shortest path quickly

#### Breadth-First Search (BFS)
- **Type**: Uninformed search
- **Optimal**: Yes (unweighted graphs)
- **Strategy**: Level-by-level exploration
- **Best for**: Guaranteed shortest path

#### Depth-First Search (DFS)
- **Type**: Uninformed search  
- **Optimal**: No
- **Strategy**: Explores as far as possible before backtracking
- **Best for**: Checking connectivity

### Maze Generation Algorithms

#### Kruskal's Algorithm
- Creates minimum spanning tree
- Uses union-find data structure
- Random edge selection

#### Prim's Algorithm
- Grows maze from single cell
- Maintains frontier of cells
- Weighted random selection

#### Recursive Backtracking
- DFS-based generation
- Creates long winding passages
- Minimal dead ends

#### Recursive Division
- Divide-and-conquer approach
- Creates chambers
- Results in straight corridors

#### Eller's Algorithm
- Row-by-row generation
- Memory efficient
- Creates horizontal bias

#### Hunt and Kill
- Random walk until stuck
- Hunt for unvisited cells
- Creates long corridors

---

## 🎨 Visual Design

### Grid Colors

- **White**: Empty, walkable cell
- **Dark Gray**: Wall (impassable)
- **Green**: Start point
- **Red**: End point
- **Light Blue**: Cells being explored
- **Yellow**: Shortest path
- **Purple**: Visited cells

### Animations

- Smooth CSS transitions
- Frame-by-frame algorithm visualization
- Adjustable animation speed
- Pause/resume capability

---

## 🚀 Deployment

Pathfinder Visualizer is deployed as part of the dreadfolio monorepo:

```bash
# Build for production
pnpm build

# Output will be in dist/ directory
# Configured for /pathfinder-visualizer/ subdirectory
```

---

## 🎓 Learning Opportunities

This project demonstrates:

1. **Algorithm Implementation**: Real-world implementations of classic CS algorithms
2. **Data Structures**: Union-find, adjacency lists, custom coordinate structures
3. **Animation Systems**: Queue-based animation with pause/resume
4. **State Management**: Complex React state for grid manipulation
5. **TypeScript Patterns**: Strong typing for coordinates, algorithms, and data structures
6. **Performance Optimization**: Efficient grid updates and rendering
7. **UI/UX Design**: Intuitive controls for complex algorithm visualization

---

## 🔧 Configuration

### TypeScript Configuration

Extends the monorepo's base TypeScript config with React-specific settings:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```

### Vite Configuration

```typescript
export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr()],
  base: '/pathfinder-visualizer/',
});
```

### ESLint Rules

Disabled rules for algorithm implementation flexibility:
- `@typescript-eslint/no-explicit-any` - Algorithms use flexible typing
- `react-hooks/exhaustive-deps` - Complex state dependencies
- `prefer-const` - Algorithm variables need mutability

---

## 📊 Bundle Analysis

- **Main bundle**: 1,026 kB (gzipped: 299 kB)
- **CSS**: 65.90 kB (gzipped: 10.77 kB)
- **Large bundle** due to Material-UI and dread-ui components
- **Optimizations**: Consider code splitting for algorithms

---

## 🐛 Known Limitations

- **Mobile Touch**: Optimized for mouse, basic touch support
- **Bundle Size**: Large due to Material-UI (consider dynamic imports)
- **Grid Size**: Very large grids (100×100+) may impact performance
- **Browser Compatibility**: Requires modern browser with ES2020 support

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Additional algorithms (Dijkstra's, Bidirectional BFS)
- [ ] Weighted graphs support
- [ ] Diagonal movement option
- [ ] Algorithm speed control slider
- [ ] Step-by-step mode
- [ ] Algorithm statistics (nodes explored, path length)
- [ ] Export/import maze layouts
- [ ] Custom grid sizes
- [ ] Mobile-optimized touch controls
- [ ] Dark mode theme

### Technical Improvements
- [ ] Code splitting by algorithm
- [ ] Web Workers for algorithm execution
- [ ] Reduce bundle size (Material-UI tree-shaking)
- [ ] Unit tests for algorithms
- [ ] E2E tests for user interactions
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

- Inspired by Clement Mihailescu's Pathfinding Visualizer
- Built as part of the [dreadfolio monorepo](https://github.com/Dreadhalor/dreadfolio)
- Algorithms based on classic computer science literature
- Material-UI for beautiful React components

---

**Visualize algorithms, understand them better! 🔍📊✨**
