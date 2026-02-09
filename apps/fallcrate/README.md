# Fallcrate

Cloud file storage application with Firebase backend.

Cloud-based file storage and management application with drag-and-drop functionality, Firebase backend, and advanced file organization features.

## Overview

Fallcrate is a full-featured file storage application that allows users to upload, organize, and manage files in the cloud. It features a modern UI with drag-and-drop functionality, file preview capabilities, and integration with Firebase for authentication and storage.

## Tech Stack

- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 5.4** - Build tool and dev server
- **Firebase** - Authentication and cloud storage
- **Ant Design 5.22** - UI component library
- **React DnD 16** - Drag and drop functionality
- **React PDF 9** - PDF viewing
- **SWC** - Fast TypeScript/JSX compilation

## Features

- 📁 **File Management** - Upload, download, rename, and delete files
- 🖱️ **Drag & Drop** - Intuitive file organization
- 👁️ **File Preview** - View images, PDFs, and videos in-app
- 🔐 **Authentication** - Firebase-based user authentication
- ☁️ **Cloud Storage** - Firebase Cloud Storage integration
- 📊 **Storage Tracking** - Monitor storage usage
- 🗂️ **Folder Organization** - Create and manage folder structures
- 🔍 **File Search** - Quick file discovery
- 📦 **Batch Operations** - Select and operate on multiple files
- ↩️ **Context Menus** - Right-click actions for files and folders

## Project Structure

```
fallcrate/
├── src/
│   ├── components/
│   │   ├── dashboard/     # Main dashboard UI
│   │   ├── main-content/  # File browser
│   │   ├── upload-queue/  # Upload progress tracking
│   │   └── utilities/     # Image/PDF/video viewers
│   ├── contexts/         # React contexts
│   ├── db/              # Firestore database hooks
│   ├── hooks/           # Custom React hooks
│   ├── providers/       # Context providers
│   ├── storage/         # Firebase storage utilities
│   └── types.ts         # TypeScript type definitions
├── public/              # Static assets
└── dist/               # Production build
```

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Firebase project with Authentication and Storage enabled
- Firebase emulators running (for local development)

### Development

**Start Firebase Emulators (Terminal 1):**
```bash
cd apps/shared-backend
pnpm start
```

**Start Fallcrate (Terminal 2):**
```bash
cd apps/fallcrate
pnpm run dev
```

App will be available at `http://localhost:5173/fallcrate/`

### Production Build

```bash
pnpm run build
```

Outputs to `dist/`

## Scripts

- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build
- `pnpm typecheck` - Run TypeScript type checking

## Configuration

### Environment Variables

Uses monorepo `.env` file at root. Required variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google providers)
3. Enable Cloud Storage
4. Add Firebase config to `.env` file
5. For local development, run Firebase emulators:
   ```bash
   cd apps/shared-backend && pnpm start
   ```

## Key Dependencies

### Core
- `react` & `react-dom` - UI framework
- `antd` - Ant Design components
- `dread-ui` - Shared component library

### File Handling
- `react-pdf` - PDF rendering
- `jszip` - ZIP file handling
- `pretty-bytes` - File size formatting

### Drag & Drop
- `react-dnd` - Drag and drop framework
- `react-dnd-html5-backend` - HTML5 backend

### UI Components
- `react-icons` - Icon library
- `react-tooltip` - Tooltips
- `react-spinners` - Loading indicators
- `react-contexify` - Context menus
- `re-resizable` - Resizable panels

## Development Notes

- Uses Firebase emulators for local development (Auth: 9099, Firestore: 8080, Storage: 9199)
- Extends monorepo's shared TypeScript and ESLint configs
- Uses `dread-ui` workspace package for authentication and shared UI
- Storage tracking and management integrated with Firebase
- File uploads handled through Firebase Cloud Storage

## Firebase Features Used

- **Authentication**: Email/Password + Google Sign-in
- **Firestore**: File metadata and folder structure
- **Cloud Storage**: File binary storage
- **Security Rules**: Row-level security for user data

## Performance Optimizations

- Lazy loading for file viewers
- Virtualized file lists for large directories
- Optimistic UI updates
- Image thumbnails for faster loading
- Chunked file uploads

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT

## Author

Scott Hetrick
