# Minesweeper

**Classic Windows Minesweeper recreation with authentic retro UI and modern React architecture**

![App Screenshot](./src/assets/screenshot.webp)

[View Live Demo](https://scottjhetrick.com/minesweeper/)

Minesweeper is a sophisticated, pixel-perfect recreation of the classic Windows Minesweeper game, built with React, TypeScript, and modern web technologies. Features draggable windows, an achievements system, and an authentic Windows XP-style desktop experience.

---

## ✨ Features

- **🎮 Classic Gameplay**: Authentic Minesweeper mechanics with mine flagging, timer, and score tracking
- **🖥️ Windows XP Desktop**: Full desktop environment with taskbar, draggable windows, and start menu
- **🏆 Achievements System**: Unlock achievements based on gameplay performance
- **📐 Multiple Difficulty Levels**: Beginner (9x9), Intermediate (16x16), and Expert (30x16)
- **🪟 Multi-Instance Support**: Open and manage multiple game windows simultaneously
- **⏱️ Real-Time Timer**: Track your solve time with an authentic 7-segment display
- **💣 Mine Counter**: Visual mine counter shows remaining mines
- **🖱️ Drag & Drop**: Fully draggable and resizable game windows
- **📱 Responsive Design**: Adapts to different screen sizes
- **🎨 Pixel-Perfect UI**: Authentic Windows Minesweeper visual assets

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS, SCSS
- **UI Components**: dread-ui (custom component library)
- **Gesture Handling**: @use-gesture/react (for draggable windows)
- **UUID Generation**: uuid v9
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
cd apps/minesweeper

# Install dependencies (or from root: pnpm install)
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173/minesweeper/`

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
minesweeper/
├── src/
│   ├── components/
│   │   ├── icon.tsx                      # Desktop icon component
│   │   ├── minesweeper/
│   │   │   ├── components/
│   │   │   │   ├── grid/
│   │   │   │   │   ├── cell.tsx          # Individual game cell
│   │   │   │   │   ├── cell.scss         # Cell styles
│   │   │   │   │   └── grid.tsx          # Game grid container
│   │   │   │   └── score-bar/
│   │   │   │       ├── digit-display.tsx # 7-segment display
│   │   │   │       ├── score-bar.tsx     # Game stats bar
│   │   │   │       └── smile-button.tsx  # Reset button
│   │   │   ├── game-menu.tsx             # Game difficulty menu
│   │   │   ├── minesweeper.tsx           # Main game component
│   │   │   └── minesweeper.scss          # Game styles
│   │   ├── taskbar/
│   │   │   ├── taskbar.tsx               # Windows-style taskbar
│   │   │   ├── taskbar-window.tsx        # Taskbar window buttons
│   │   │   ├── taskbar-time.tsx          # Clock display
│   │   │   └── taskbar.scss              # Taskbar styles
│   │   └── window/
│   │       ├── window.tsx                # Draggable window container
│   │       ├── header.tsx                # Window title bar
│   │       ├── window.scss               # Window styles
│   │       └── header.scss               # Header styles
│   ├── providers/
│   │   ├── app-provider.tsx              # Global app state
│   │   └── minesweeper-provider.tsx      # Game state management
│   ├── assets/
│   │   └── minesweeper/
│   │       ├── cell/                     # Cell state images
│   │       ├── digits/                   # 7-segment digit images
│   │       ├── smile/                    # Smiley button states
│   │       └── minesweeper-icon.png      # Desktop icon
│   ├── app.tsx                           # Main app component
│   ├── app.scss                          # Global app styles
│   └── index.scss                        # Root styles
├── public/
│   └── icon.svg                          # Favicon
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

## 🎮 How to Play

### Starting a Game
1. **Double-click** the Minesweeper desktop icon to open the game
2. The game starts when you click your first cell
3. Use the **Game** menu to select difficulty

### Game Controls
- **Left-click**: Reveal a cell
- **Right-click**: Place/remove a flag
- **Both buttons** (or middle-click): Quick reveal adjacent cells if flags match number

### Winning
- Clear all cells without hitting a mine
- Flag all mines (optional)
- Beat your best time!

### Difficulty Levels
- **Beginner**: 9×9 grid, 10 mines
- **Intermediate**: 16×16 grid, 40 mines
- **Expert**: 30×16 grid, 99 mines

---

## 🏛️ Architecture

### Component Structure

The application follows a modular, component-based architecture:

- **Grid and Cells**: Core game logic and rendering
- **Score Bar**: Timer, mine counter, and reset button
- **Window System**: Draggable windows with focus management
- **Taskbar**: Desktop-style task management
- **Desktop**: Icon grid and window positioning

### State Management

State is managed through React Context providers:

1. **AppProvider**: Global state (open windows, focus, taskbar)
2. **MinesweeperProvider**: Game state (grid, timer, status, achievements)

### Context Providers

```typescript
// difficultySettings
beginner: { rows: 9, cols: 9, bombs: 10 }
intermediate: { rows: 16, cols: 16, bombs: 40 }
expert: { rows: 30, cols: 16, bombs: 99 }

// GameStatus
'new' | 'started' | 'won' | 'lost'

// CellType
{ val: number, isRevealed: boolean, isFlagged: boolean }
```

### Integration with Shared Systems

- **dread-ui**: Shared component library (Card, UserMenu, achievements)
- **Achievements System**: Unlock achievements for gameplay milestones
- **@repo/config**: Shared Tailwind configuration
- **@repo/typescript-config**: Shared TypeScript configuration

---

## 🔧 Configuration

### TypeScript Configuration

The project extends the monorepo's base TypeScript config:

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
  base: '/minesweeper/',
});
```

### Tailwind Configuration

Extends the shared monorepo Tailwind config for consistency.

---

## 🎨 Visual Assets

### Authentic Windows UI

All visual assets are pixel-perfect recreations of classic Windows Minesweeper:

- **Cells**: Unopened, flagged, numbers (1-8), mines, explosions
- **Digits**: 7-segment display for timer and counter (-999 to 999)
- **Smiley**: Normal, pressed, "ohh!", win, dead states
- **Icons**: Desktop icons and taskbar buttons

---

## 🚀 Deployment

Minesweeper is deployed as part of the dreadfolio monorepo:

```bash
# Build for production
pnpm build

# Output will be in dist/ directory
# Configured for /minesweeper/ subdirectory deployment
```

---

## 🎓 Best Practices

This project demonstrates:

1. **Modular Component Design**: Reusable, self-contained components
2. **Type Safety**: Full TypeScript coverage with strict mode
3. **Centralized State**: Context-based state management
4. **Separation of Concerns**: Clear boundaries between UI, logic, and data
5. **Responsive Design**: Mobile-friendly with desktop experience
6. **Code Quality**: ESLint, consistent formatting, zero warnings
7. **Efficient Asset Management**: Optimized image loading and caching
8. **Gesture Handling**: Smooth drag-and-drop with `@use-gesture/react`

---

## 🏆 Achievements System

The game integrates with the dreadfolio achievements system:

- **First Game**: Play your first game
- **First Win**: Complete your first game successfully
- **Speed Demon**: Win a beginner game in under 10 seconds
- **Minesweeper Master**: Win an expert game
- **No Flags Needed**: Win without placing any flags
- **Perfect Clear**: Clear all cells without flagging

---

## 🐛 Known Limitations

- **Touch Support**: Optimized for mouse, basic touch support
- **Mobile Performance**: May be slower on older mobile devices
- **Multiple Windows**: Performance may degrade with many open windows
- **Browser Compatibility**: Requires modern browser with ES2020 support

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Custom grid sizes and mine counts
- [ ] High score leaderboard
- [ ] Replay system
- [ ] Hints and tutorial mode
- [ ] Sound effects and music
- [ ] Themes (Windows 95, Windows 7, Modern)
- [ ] Multiplayer competitive mode
- [ ] Mobile-optimized touch controls

### Technical Improvements
- [ ] Service Worker for offline play
- [ ] Progressive Web App (PWA) support
- [ ] Reduced bundle size with code splitting
- [ ] Improved accessibility (keyboard navigation)
- [ ] Unit tests for game logic
- [ ] E2E tests with Playwright

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

- Inspired by classic Windows Minesweeper
- Built as part of the [dreadfolio monorepo](https://github.com/Dreadhalor/dreadfolio)
- Windows XP Bliss wallpaper used with respect for its iconic design
- Microsoft for creating the original Minesweeper

---

**Clear the mines, beat the clock, and have fun! 💣⏱️**
