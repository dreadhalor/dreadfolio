# ShareMe

Social media application for sharing images and content, built with React frontend and Sanity CMS backend.

## Overview

ShareMe is a full-featured social media platform that allows users to share images, create pins, and interact with content. It features a modern masonry layout, real-time updates via Sanity CMS, and Google OAuth authentication.

## Architecture

ShareMe consists of two main components:

- **Frontend** - React 18 + TypeScript + Vite application
- **Backend** - Sanity Studio (headless CMS for content management)

## Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 5.4** - Build tool and dev server
- **React Router 7.1** - Client-side routing
- **Sanity Client 6.24** - Connect to Sanity backend
- **React Masonry CSS** - Masonry layout
- **SWC** - Fast TypeScript/JSX compilation

### Backend
- **Sanity Studio 3.68** - Headless CMS
- **Sanity Vision** - Query testing tool
- **React 18.3** - Sanity Studio UI framework

## Features

- 🖼️ **Image Sharing** - Upload and share images
- 📌 **Pin Creation** - Create and organize content pins
- 🔐 **Authentication** - Google OAuth integration
- 🎨 **Masonry Layout** - Pinterest-style responsive grid
- 🔍 **Search & Discovery** - Find content and users
- ❤️ **Likes & Comments** - Social interaction features
- 👤 **User Profiles** - Personalized user pages
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Real-time Updates** - Live content via Sanity

## Project Structure

```
shareme/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── container/    # Page layouts
│   │   ├── utils/        # Utility functions
│   │   └── main.tsx      # Entry point
│   ├── public/           # Static assets
│   └── package.json
├── backend/              # Sanity Studio
│   ├── schemas/         # Content schemas
│   ├── static/          # Static assets
│   └── sanity.config.ts # Sanity configuration
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Sanity account (sign up at [sanity.io](https://www.sanity.io))
- Google OAuth credentials (for authentication)

### Development

**Terminal 1 - Start Sanity Studio:**
```bash
cd apps/shareme/backend
pnpm run dev
```

Sanity Studio will be available at `http://localhost:3333`

**Terminal 2 - Start Frontend:**
```bash
cd apps/shareme/frontend
pnpm run dev
```

Frontend will be available at `http://localhost:5173/shareme/`

### Production Build

**Frontend:**
```bash
cd apps/shareme/frontend
pnpm run build
```

**Backend:**
```bash
cd apps/shareme/backend
pnpm run build
```

## Scripts

### Frontend Scripts
- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build
- `pnpm typecheck` - Run TypeScript type checking

### Backend Scripts
- `pnpm dev` - Start Sanity Studio dev server
- `pnpm build` - Build Sanity Studio for production
- `pnpm start` - Start Sanity Studio (production)

## Configuration

### Environment Variables

Uses monorepo `.env` file at root. Required variables:

```env
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_TOKEN=your_token
VITE_GOOGLE_API_TOKEN=your_google_oauth_token
```

### Sanity Setup

1. Create a Sanity project at [sanity.io](https://www.sanity.io)
2. Get your Project ID from the project settings
3. Generate an API token with Editor permissions
4. Add credentials to `.env` file
5. Deploy your schemas:
   ```bash
   cd apps/shareme/backend
   pnpm run deploy
   ```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins and redirect URIs
6. Copy Client ID to `.env` as `VITE_GOOGLE_API_TOKEN`

## Key Dependencies

### Frontend
- `@sanity/client` - Sanity API client
- `@sanity/image-url` - Image URL builder
- `react-router-dom` - Routing
- `react-masonry-css` - Masonry layout
- `react-loader-spinner` - Loading indicators
- `dread-ui` - Shared component library

### Backend
- `sanity` - Sanity Studio
- `@sanity/vision` - Query testing
- `styled-components` - CSS-in-JS

## Sanity Features Used

- **Schemas** - Custom content types (pins, users, comments)
- **Real-time** - Live queries for instant updates
- **Image Pipeline** - Automatic image optimization
- **GROQ** - Graph-Relational Object Queries
- **Vision** - Query playground for development

## Content Schemas

ShareMe uses the following Sanity schemas:

- **User** - User profiles and authentication
- **Pin** - Image posts with metadata
- **Comment** - User comments on pins
- **Category** - Content categorization

## Performance Optimizations

- Image optimization via Sanity CDN
- Lazy loading for images
- Masonry layout virtualization
- React.lazy for code splitting
- Optimistic UI updates
- Cached queries

## Development Notes

- Frontend extends monorepo's shared TypeScript and ESLint configs
- Backend uses Sanity's ESLint config for Studio
- Uses `dread-ui` workspace package for shared UI components
- Sanity Studio runs independently on port 3333
- Frontend uses SWC for faster compilation

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Known Issues

- Sanity is moving to v4 in the future (requires Node.js 20+)
- See [Sanity blog](https://www.sanity.io/blog/a-major-version-bump-for-a-minor-reason) for migration guide

## License

MIT

## Author

Scott Hetrick

## Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity Studio](https://www.sanity.io/studio)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [React Documentation](https://react.dev)
