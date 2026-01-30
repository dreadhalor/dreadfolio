# Dreadfolio

**Scott Hetrick's Personal Portfolio Monorepo**

A comprehensive showcase of web development projects built over 5 years, demonstrating full-stack capabilities, modern tooling, and diverse technical skills.

> 🚧 **Status**: Currently undergoing modernization to industry-standard monorepo architecture. See [INFRASTRUCTURE_AUDIT.md](./INFRASTRUCTURE_AUDIT.md) for details.

---

## 🎯 What is This?

Dreadfolio is a **meta-portfolio** - a working demonstration of software engineering capabilities that proves skills by being itself. It hosts 12+ interactive web applications ranging from games to productivity tools to social platforms.

**Live Portfolio**: [scottjhetrick.com](https://scottjhetrick.com)

---

## 🏗️ Architecture

### Current Structure (Transitioning)

This repository currently uses **git submodules** for individual apps that were built independently over time, with a shared package infrastructure managed via pnpm workspaces.

```
dreadfolio/
├── apps/              # Individual applications (currently git submodules)
│   ├── minesweeper/   # Classic Minesweeper with achievements
│   ├── fallcrate/     # Dropbox-inspired cloud storage
│   ├── su-done-ku/    # Sudoku solver with step-by-step logic
│   ├── pathfinder-visualizer/  # Algorithm visualizations
│   ├── shareme/       # Pinterest-inspired social platform
│   ├── home-page/     # Portfolio landing page
│   ├── portfolio/     # Full portfolio site (deployed to EC2)
│   └── ...            # + 5 more apps
├── packages/          # Shared infrastructure (true monorepo)
│   ├── dread-ui/      # Custom React component library
│   ├── utils/         # Shared utilities
│   ├── assets/        # Shared images/icons
│   └── typescript-config/  # Shared TS configs
└── infra/             # Docker/nginx configuration
```

### Target Architecture

**Migrating to**: True monorepo with unified git history and workspace management (industry standard, 2026)

**Why the change?**
- Better developer experience
- Type safety across app boundaries
- Atomic commits and refactoring
- Matches industry standards (Google, Meta, Vercel)
- Improved CI/CD simplicity

---

## 🚀 Featured Projects

### Interactive Demos

- **[Minesweeper](./apps/minesweeper)** - Classic game with achievements system, drag-and-drop windows
- **[Pathfinding Visualizer](./apps/pathfinder-visualizer)** - Dijkstra's, BFS, A* algorithm visualizations
- **[Su-Done-Ku](./apps/su-done-ku)** - Sudoku solver with logical step-by-step explanations
- **[Enlight](./apps/enlight)** - Raycasting light simulation

### Full Applications

- **[Fallcrate](./apps/fallcrate)** - Cloud storage app with Firebase backend
- **[ShareMe](./apps/shareme)** - Social media platform for image sharing
- **[Gifster](./apps/gifster)** - Giphy API integration for GIF discovery
- **[Quipster](./apps/quipster)** - Vocabulary and word list management

### Creative Projects

- **[Sketches](./apps/sketches)** - Collection of creative coding experiments
- **[ASCII Video](./apps/ascii-video)** - Real-time video to ASCII art converter
- **[Steering Text](./apps/steering-text)** - Text animation with steering behaviors

---

## 🛠️ Tech Stack

**Frontend**: React, TypeScript, Vite, Tailwind CSS  
**Backend**: Node.js, Express, Firebase  
**Monorepo**: pnpm workspaces, Turborepo  
**Infrastructure**: Docker, AWS (EC2, ECR), nginx  
**CI/CD**: GitHub Actions  
**Tools**: ESLint, Prettier, Sass

---

## 📦 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.1
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dreadfolio.git
cd dreadfolio

# Pull git submodules (temporary - will be removed during modernization)
pnpm run pull-submodules

# Install all dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start all apps in development mode
pnpm dev

# Build all apps
pnpm build
```

### Environment Variables

See [`.env.example`](./.env.example) for required environment variables. You'll need:
- Vercel token (for Turborepo remote caching)
- Giphy API key (for Gifster app)
- Firebase credentials (for Fallcrate, ShareMe)

---

## 🧰 Common Commands

```bash
# Development
pnpm dev                    # Start all apps in dev mode
pnpm dev --filter=minesweeper  # Start specific app

# Building
pnpm build                  # Build all apps
pnpm build-low-mem          # Build with limited concurrency
pnpm build-more-mem         # Build with high concurrency

# Linting & Formatting
pnpm lint                   # Lint all packages
pnpm format                 # Format code with Prettier

# Testing
pnpm test                   # Run all tests

# Submodule Management (temporary)
pnpm run pull-submodules    # Update all submodules
```

---

## 🚢 Deployment

### Primary Deployment (Portfolio Backend)

The main portfolio app is deployed to AWS EC2 via Docker:

```bash
# Build and deploy to EC2
./deploy.sh

# Or use GitHub Actions workflow
# Trigger: Manual workflow_dispatch
```

### CI/CD Pipeline

GitHub Actions workflow builds and deploys to:
- Docker image → Amazon ECR
- Deploy → EC2 instance
- Nginx reverse proxy for routing

---

## 📚 Documentation

- **[Infrastructure Audit](./INFRASTRUCTURE_AUDIT.md)** - Comprehensive analysis of current issues and improvement roadmap
- **[Individual App READMEs](./apps/)** - Each app has its own documentation

---

## 🎓 Learning Journey

This monorepo represents 5 years of learning and building:

- **2019**: Early projects (enlight, ascii-video)
- **2020-2021**: Game implementations (minesweeper, pathfinder-visualizer)
- **2022-2023**: Full-stack applications (fallcrate, shareme, su-done-ku)
- **2024**: Component library and design system (dread-ui)
- **2025-2026**: Monorepo consolidation and modernization

Each project captures the skills and knowledge at that point in time. The ongoing modernization effort demonstrates continued growth and commitment to best practices.

---

## 🔧 Maintenance Status

**Active Modernization** (2026): Currently implementing industry-standard monorepo patterns and resolving technical debt identified in infrastructure audit.

**Priority improvements**:
1. ✅ Security: Fixed hardcoded API keys
2. ✅ Documentation: Added .env.example and comprehensive README
3. 🚧 Architecture: Migrating from git submodules to true monorepo
4. 🚧 Dependencies: Standardizing versions across all packages
5. 🚧 Type Safety: Reducing `any` usage and improving TypeScript strictness

See [INFRASTRUCTURE_AUDIT.md](./INFRASTRUCTURE_AUDIT.md) for complete improvement roadmap.

---

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome! Feel free to:
- Open issues for bugs or suggestions
- Review the infrastructure audit and provide feedback
- Share ideas for architectural improvements

---

## 📄 License

Individual projects may have different licenses. See each app's directory for details.

---

## 👤 About

**Scott Hetrick**
- Tech Lead experience (Broadlume, 2022-2024)
- Senior Full Stack Engineer (Stash, 2021-2022)
- [LinkedIn](https://linkedin.com/in/scotthetrick)
- [Portfolio](https://scottjhetrick.com)

---

## 🎯 Meta-Portfolio Philosophy

This repository itself demonstrates:
- **Full-stack development**: Frontend, backend, infrastructure
- **Modern tooling**: Monorepo management, CI/CD, containerization
- **Diverse skills**: Games, algorithms, social platforms, cloud storage
- **Continuous improvement**: Active refactoring and modernization
- **Production readiness**: Real apps with real traffic (5K+ requests/day)

*The best portfolio proves skills by being itself.*
