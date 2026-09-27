# Pathfinder Visualizer

**Interactive algorithm visualizer for pathfinding and maze generation**

[View Live Demo](https://scottjhetrick.com/pathfinder-visualizer/)

Pathfinder Visualizer is an interactive educational tool that brings graph algorithms to life. Watch A*, BFS and DFS find their way through mazes, and six maze generators — Kruskal's, Prim's, Recursive Backtracking and more — build them square by square.

---

## ✨ Features

- **🔍 Pathfinding Algorithms**: Watch A*, BFS and DFS search from start to end
- **🏗️ Maze Generation**: Six maze generation algorithms, animated as they build
- **🎨 Interactive Grid**: Draw and erase walls, move start/end points with mouse or touch
- **⚡ Real-time Animation**: Watch algorithms explore the grid step-by-step
- **📊 Live Results**: A status line counts the squares a search visits, then reports the path's length (or that there's no way through)
- **❔ Built-in Help**: A how-to and a colour key, one tap away
- **📐 Responsive Layout**: The grid fills whatever space there is; the header and controls adapt down to phones

---

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **UI Components**: Base UI (@base-ui/react) menus, select, toggle group and popover; Lucide icons
- **Linting**: ESLint with TypeScript support

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
│   │   ├── header.tsx                # The app's name, the controls, help
│   │   ├── toolbar.tsx               # What a press places (Wall/Start/End) and the three menus
│   │   ├── help.tsx                  # The how-to popover
│   │   ├── legend.tsx                # The colour key
│   │   ├── status-bar.tsx            # The colour key and the status line
│   │   ├── grid.tsx                  # The grid: pointer → square, drag painting
│   │   ├── grid-square.tsx           # One square: its state, looks and animations
│   │   └── grid-square.css           # The squares' pop, finish and path keyframes
│   ├── utilities/
│   │   ├── algorithm-methods.ts      # Shared maze/search helpers
│   │   ├── animations.ts             # Animation step builders
│   │   ├── animator.ts               # Plays animation steps a few per frame (cancellable)
│   │   ├── data-structures/          # Grid sets, adjacency list, union-find, path list
│   │   ├── maze-generation/          # Eller's, hunt-and-kill, Kruskal's, Prim's,
│   │   │                             # recursive backtracking, recursive division
│   │   ├── maze-structures.ts        # Maze utility functions
│   │   ├── randomizers.ts            # Shuffle, coin flips, dice
│   │   └── solvers/                  # A*, BFS, DFS (and the raw BFS used to place endpoints)
│   ├── status.ts                     # The status line's store (only the status bar redraws)
│   ├── types.ts                      # Coordinates and the Square contract
│   ├── app.tsx                       # Layout, grid sizing, actions, drawing
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Tailwind, the brand font, the board's colour tokens
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎮 How to Use

### Grid Interaction

1. **Start Point** (Green): Drag to move
2. **End Point** (Red): Drag to move
3. **Drawing Walls**: Click and drag on empty cells
4. **Erasing**: Start a drag on a wall to erase instead
5. **Placing Start/End**: Pick Start or End in the toolbar, then click where it goes

### Solving the Maze

1. Click **"Solve It!"** and choose an algorithm:
   - **A*** - Optimal, uses heuristics (Manhattan distance)
   - **BFS** - Optimal, explores level-by-level
   - **DFS** - Not optimal, explores depth-first
2. Watch the algorithm explore the grid in real-time; the status line reports the path's length and how many squares were visited

### Generating Mazes

Click **"Generate Maze"** and choose an algorithm:

1. **Kruskal's Algorithm** - Randomly connects cells using union-find
2. **Prim's Algorithm** - Grows maze from random cell
3. **Recursive Backtracking** - DFS-based maze generation
4. **Recursive Division** - Divides space recursively
5. **Eller's Algorithm** - Row-by-row maze generation
6. **Hunt and Kill** - Combines random walk with systematic hunting

### Controls

- **Clear Map**: Clear Path removes a search's marks; Clear Walls removes every wall

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
- Picks the next frontier cell at random

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
- **Slate**: Wall (impassable) — a square gone clear, the page showing through
- **Green**: Start point
- **Red**: End point
- **Light Green**: Frontier (queued to be searched)
- **Light Blue**: Visited cells
- **Yellow**: The path found, with arrows toward the end

The colours are CSS tokens in `index.css`, shared by the squares and the key.

### Animations

- Smooth CSS transitions and pops
- Frame-by-frame algorithm visualization
- Starting anything new stops whatever was still playing

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
3. **Animation Systems**: A cancellable, frame-paced animation queue
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
  resolve: { dedupe: ['react', 'react-dom'] },
  plugins: [react(), tailwindcss(), tsconfigPaths()],
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

- **Main bundle**: 398 kB (gzipped: 131 kB)
- **CSS**: 20 kB (gzipped: 5 kB)

---

## 🐛 Known Limitations

- **Grid Size**: Very large grids (100×100+) may impact performance
- **Browser Compatibility**: Requires modern browser with ES2020 support

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Additional algorithms (Bidirectional BFS, Greedy best-first)
- [ ] Weighted graphs support
- [ ] Diagonal movement option
- [ ] Algorithm speed control slider
- [ ] Step-by-step mode
- [ ] Export/import maze layouts
- [ ] Custom grid sizes
- [ ] Dark mode theme

### Technical Improvements
- [ ] Code splitting by algorithm
- [ ] Web Workers for algorithm execution
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

---

**Visualize algorithms, understand them better! 🔍📊✨**
