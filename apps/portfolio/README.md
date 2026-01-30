# Portfolio

Scott Hetrick's personal portfolio website showcasing projects, skills, and experience.

## Overview

This is the main portfolio site that serves as the central hub for all projects and applications in the dreadfolio monorepo. It provides navigation and showcases various projects including games, visualizations, and web applications.

## Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 5.4** - Build tool and dev server  
- **React Router 7** - Client-side routing
- **Framer Motion 11** - Animations
- **SWC** - Fast TypeScript/JSX compilation

### Backend
- **Express 4** - Web server
- **TypeScript 5.6** - Type safety
- **Node.js** - Runtime
- **Nodemon** - Development auto-reload

## Project Structure

```
portfolio/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── dist/         # Production build
├── backend/          # Express backend server
│   ├── src/          # Source code
│   │   └── server.ts # Main server file
│   └── dist/         # Compiled JavaScript
└── README.md         # This file
```

## Features

- **Project Showcase** - Interactive gallery of projects
- **Responsive Design** - Works on all device sizes
- **Smooth Animations** - Powered by Framer Motion
- **Static Serving** - Serves all monorepo apps from single backend
- **Hot Module Replacement** - Fast development with Vite HMR

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+

### Development

**Terminal 1 - Backend:**
```bash
cd apps/portfolio/backend
pnpm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/portfolio/frontend
pnpm run dev
```

Frontend will be available at `http://localhost:5173/`  
Backend API at `http://localhost:3000/`

### Production Build

**Frontend:**
```bash
cd apps/portfolio/frontend
pnpm run build
```

Outputs to `frontend/dist/`

**Backend:**
The backend serves static files in production from the `dist` folders of all apps.

## Scripts

### Frontend
- `pnpm dev` - Start Vite dev server
- `pnpm dev-host` - Start dev server with network access
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

### Backend
- `pnpm dev` - Start with auto-reload (development)
- `pnpm start` - Start server (production)

## Configuration

### Environment Variables
Uses monorepo `.env` file at root. See root `.env` for required variables.

### Routes Served

The backend serves static files for all monorepo apps:
- `/` - Portfolio frontend
- `/pathfinder-visualizer` - Pathfinding visualizer
- `/minesweeper` - Minesweeper game
- `/enlight` - Photo editor
- `/ascii-video` - ASCII video effect
- `/dread-ui` - Component library showcase
- `/home` - Home page
- `/steering-text` - Text steering demo
- `/shareme` - Social media app
- `/su-done-ku` - Sudoku solver
- `/gifster` - GIF maker
- `/sketches` - p5.js sketches
- `/fallcrate` - File storage app

## Dependencies

### Frontend Key Dependencies
- `react` & `react-dom` - UI framework
- `react-router-dom` - Routing
- `framer-motion` - Animations
- `dread-ui` - Shared component library
- `home-page` - Home page workspace package
- `@repo/sketches` - p5.js sketches workspace package

### Backend Key Dependencies
- `express` - Web framework
- `cors` - CORS middleware
- `@repo/su-done-ku-backend` - Sudoku API routes

## Development Notes

- Frontend uses monorepo's shared TypeScript and ESLint configs
- Backend extends `@repo/typescript-config/base.json`
- Both use `dotenvx` for environment variable injection
- Workspace packages are linked via pnpm workspaces

## License

MIT

## Author

Scott Hetrick
