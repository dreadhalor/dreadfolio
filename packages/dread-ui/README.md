# Dread UI

Shared UI component library for the Dreadfolio monorepo, built with React, Radix UI, Tailwind CSS, and Storybook.

## Overview

Dread UI is a comprehensive component library that provides shared UI components, authentication providers, and utilities used across all applications in the Dreadfolio monorepo.

## Features

- 🎨 **Modern Component Library** - Built with Radix UI primitives
- 🎭 **Storybook Integration** - Interactive component documentation
- 🔐 **Authentication** - Firebase authentication provider
- 🏆 **Achievements System** - Gamification components
- 🌗 **Theme Support** - Dark/light mode with next-themes
- 📱 **Responsive Design** - Mobile-first approach
- ♿ **Accessible** - ARIA-compliant components via Radix UI
- 🎨 **Tailwind CSS** - Utility-first styling with custom animations

## Tech Stack

- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Storybook 8.5** - Component development environment
- **Vite 5.4** - Build tool
- **Firebase 11** - Authentication backend
- **SWC** - Fast TypeScript/JSX compilation

## Components

### UI Components
- **Accordion** - Collapsible content sections
- **Avatar** - User profile images with fallbacks
- **Button** - Various button styles and variants
- **Card** - Content containers
- **Checkbox** - Selection controls
- **Dialog** - Modal dialogs
- **Dropdown Menu** - Context menus
- **Form** - Form controls with validation (React Hook Form + Zod)
- **Input** - Text input fields
- **Label** - Form labels
- **Popover** - Floating content
- **Radio Group** - Single selection controls
- **Select** - Dropdown selection
- **Separator** - Visual dividers
- **Slider** - Range inputs
- **Switch** - Toggle controls
- **Tabs** - Tabbed interfaces
- **Tooltip** - Hover information

### Custom Components
- **Command Palette** - Keyboard-driven command interface
- **Date Picker** - Calendar date selection
- **Resizable Panels** - Adjustable layouts
- **Toast** - Notifications (Sonner)
- **Theme Toggle** - Dark/light mode switcher

### Providers
- **AuthProvider** - Firebase authentication context
- **AchievementsProvider** - Gamification system
- **TooltipProvider** - Tooltip context
- **IframeProvider** - Iframe detection context
- **DreadUiProvider** - All-in-one provider wrapper

## Project Structure

```
dread-ui/
├── src/
│   ├── components/     # UI components
│   │   ├── ui/        # Base components (Radix UI)
│   │   └── ...        # Custom components
│   ├── providers/     # Context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/          # Utility functions
│   └── index.tsx     # Main exports
├── .storybook/       # Storybook configuration
├── dist/            # Built Storybook
└── output.css       # Compiled Tailwind CSS
```

## Development

### Start Storybook

```bash
cd packages/dread-ui
pnpm run storybook
```

Storybook will be available at `http://localhost:6006`

### Build Storybook

```bash
pnpm run build
```

Outputs to `dist/`

### Build Tailwind CSS

```bash
pnpm run build:css
```

Compiles `src/index.scss` to `output.css`

## Scripts

- `pnpm dev` - Start Storybook dev server (alias for storybook)
- `pnpm lint` - Run ESLint
- `pnpm storybook` - Start Storybook dev server
- `pnpm build` - Build Storybook (alias for build-storybook)
- `pnpm build-storybook` - Build Storybook for production
- `pnpm build:css` - Compile Tailwind CSS

## Usage in Apps

Import components from the package:

```tsx
import { Button, Card, Dialog, DreadUiProvider } from 'dread-ui';

function App() {
  return (
    <DreadUiProvider>
      <Card>
        <Button>Click me</Button>
      </Card>
    </DreadUiProvider>
  );
}
```

### Styling

Import the built CSS:

```tsx
// In your app's main file
import 'dread-ui/built-style.css';
```

Or import the SCSS source:

```tsx
import 'dread-ui/style.scss';
```

## Exports

The package exports:

- **Components** - All UI components via `dread-ui`
- **Styles (CSS)** - Pre-built CSS via `dread-ui/built-style.css`
- **Styles (SCSS)** - Source SCSS via `dread-ui/style.scss`

## Key Dependencies

### Core
- `react` & `react-dom` - UI framework
- `@repo/utils` - Shared utilities (Firebase, etc.)

### UI Primitives
- All `@radix-ui/*` packages - Accessible component primitives
- `class-variance-authority` - Component variants
- `clsx` & `tailwind-merge` - Class name utilities
- `tailwindcss-animate` - Animation utilities

### Forms
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Validation resolvers
- `zod` - Schema validation

### Icons & Avatars
- `@dicebear/core` & `@dicebear/collection` - Avatar generation
- `@radix-ui/react-icons` - Icon set
- `react-icons` - Additional icons

### Utilities
- `next-themes` - Theme management
- `date-fns` - Date formatting
- `sonner` - Toast notifications
- `cmdk` - Command palette
- `react-day-picker` - Date picker
- `react-resizable-panels` - Resizable layouts
- `react-resize-detector` - Resize detection

## Firebase Integration

Dread UI includes Firebase authentication via `AuthProvider`. It uses the shared Firebase config from `@repo/utils/firebase`.

### Environment Variables

Required for Firebase (in monorepo `.env`):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Storybook

Storybook v8.5 is used for component development and documentation. To view all components interactively:

```bash
pnpm run storybook
```

Navigate to `http://localhost:6006` to explore:
- Component documentation
- Interactive props
- Visual testing
- Code examples

## TypeScript

The package uses TypeScript 5.6 with strict mode enabled. TypeScript configuration extends the monorepo's shared config:

```json
{
  "extends": "@repo/typescript-config/react-library.json"
}
```

## ESLint

ESLint configuration includes:
- TypeScript support
- React hooks rules
- Storybook rules
- React refresh (for HMR)

## Design System

Dread UI follows a cohesive design system with:
- Consistent spacing and sizing
- Color palette (light/dark modes)
- Typography scale
- Shadow system
- Border radius scale
- Animation standards

All customizable via Tailwind CSS configuration.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance

- Tree-shakeable exports
- Lazy loading support
- Optimized bundle sizes
- Fast compilation with SWC

## Contributing

When adding new components:
1. Create component in `src/components/`
2. Export from `src/index.tsx`
3. Add Storybook story in `src/components/*.stories.tsx`
4. Document props and usage
5. Ensure accessibility
6. Test in multiple apps

## Version History

- **v1.0.0** - Modernized to Storybook 8, updated all dependencies, integrated into monorepo

## License

MIT

## Author

Scott Hetrick
