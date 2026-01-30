# GIFster

**A modern GIF search engine powered by the Giphy API**

![App Screenshot](https://via.placeholder.com/800x400?text=GIFster+Screenshot)

[View Live Demo](https://scottjhetrick.com/gifster/)

GIFster is a sleek, feature-rich GIF discovery application that leverages the Giphy API to help users find and share the perfect GIFs. Built with React, TypeScript, and modern web technologies, it demonstrates clean architecture, performance optimization, and excellent user experience design.

---

## ✨ Features

- **🔍 Powerful Search**: Search through millions of GIFs from Giphy's extensive library
- **📈 Trending Content**: Discover what's trending with real-time trending searches
- **🏆 Achievements System**: Unlock achievements as you explore and interact with GIFs
- **📋 One-Click Copy**: Instantly copy GIF URLs to your clipboard
- **👤 Creator Profiles**: View GIF creators and explore their profiles
- **📱 Responsive Design**: Optimized for all screen sizes with adaptive masonry layout
- **⚡ Performance Optimized**: Fast loading with memoization and efficient rendering
- **🎨 Modern UI**: Clean, intuitive interface with Tailwind CSS

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS, SCSS
- **UI Components**: dread-ui (custom component library)
- **API**: Giphy API (@giphy/js-fetch-api, @giphy/js-types)
- **Layout**: react-masonry-css (responsive grid)
- **Icons**: React Icons
- **Linting**: ESLint with TypeScript support

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.1
- Giphy API Key ([Get one here](https://developers.giphy.com/))

### Installation

```bash
# From the monorepo root
cd apps/gifster

# Install dependencies (or from root: pnpm install)
pnpm install

# Set up environment variables
# Add VITE_GIPHY_API_KEY to root .env file:
# VITE_GIPHY_API_KEY=your_api_key_here

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173/gifster/`

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
gifster/
├── src/
│   ├── components/
│   │   ├── gif-grid.tsx          # Main grid component with Masonry layout
│   │   ├── gif-preview.tsx       # Individual GIF preview with actions
│   │   ├── search-bar.tsx        # Search input component
│   │   └── trending-searches.tsx # Trending search chips
│   ├── app.tsx                   # Main application component
│   ├── main.tsx                  # Application entry point
│   └── index.scss                # Global styles and theme
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🎮 Usage

### Searching for GIFs

1. Type your search query in the search bar
2. Press Enter or click the search button
3. Browse results in the responsive masonry grid
4. Click any GIF to view it in a larger preview

### Viewing GIF Details

- **Preview**: Click a GIF to open the detailed preview modal
- **Copy URL**: Click the clipboard icon to copy the GIF URL
- **Visit Creator**: Click the creator's profile to view their work
- **External Link**: Click the external link icon to view on Giphy

### Discovering Trending Content

- View trending search terms at the top of the page
- Click any trending term to instantly search for those GIFs
- Unlock the "Trending Search" achievement by searching trending terms

---

## 🏆 Achievements

GIFster includes an integrated achievements system:

- **Search GIF**: Search for a GIF
- **Trending Search**: Search for a trending term
- **No Results**: Experience a search with no results
- **Poster Profile**: Visit a GIF creator's profile

---

## 🔧 Configuration

### Environment Variables

Required in `.env` file at monorepo root:

```bash
# Giphy API Configuration
VITE_GIPHY_API_KEY=your_giphy_api_key_here
```

### Vite Configuration

The app uses several Vite plugins for enhanced functionality:

- `@vitejs/plugin-react-swc`: Fast React refresh with SWC
- `vite-tsconfig-paths`: TypeScript path mapping support
- `vite-plugin-svgr`: SVG as React components

### TypeScript Configuration

Extends the base monorepo TypeScript configuration with app-specific settings. Path aliases are configured for clean imports.

---

## 🎨 Theming

GIFster uses a comprehensive CSS custom properties system for theming. Colors, spacing, and other design tokens are defined in `src/index.scss` and can be customized per your needs.

Key theme variables:
- `--font-sans`: Main font family
- `--font-serif`: Serif font for headers
- `--primary`: Primary brand color
- `--background`: Background color
- `--foreground`: Text color

Dark mode is supported via the `.dark` class.

---

## 🚀 Deployment

The app is deployed as part of the larger dreadfolio monorepo. The production build is served with the base path `/gifster/`.

Build for production:

```bash
pnpm build
```

Output will be in the `dist/` directory.

---

## 🧪 Development

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with React and TypeScript rules
- **Component Organization**: Clear separation of concerns
- **Performance**: Optimized with useMemo and proper dependency management

### Best Practices Followed

- ✅ No usage of `any` type
- ✅ Proper error handling (no alerts in production)
- ✅ All useEffect dependencies correctly specified
- ✅ Performance optimizations (memoization, component splitting)
- ✅ Accessibility considerations
- ✅ Responsive design patterns
- ✅ Clean, documented code

---

## 📝 API Integration

### Giphy API

GIFster integrates with the Giphy API v1:

**Endpoints used:**
- `/v1/gifs/search` - Search GIFs by keyword
- `/v1/gifs/trending` - Get trending GIFs
- `/v1/trending/searches` - Get trending search terms

**Rate Limits**: Respect Giphy's API rate limits (typically 42 requests per hour for free tier, 1000 requests per hour for paid).

**Documentation**: [Giphy Developers](https://developers.giphy.com/docs/api/)

---

## 🤝 Contributing

This is part of a larger monorepo project. For contribution guidelines, see the main repository README.

---

## 📄 License

MIT License - See main repository for details

---

## 👤 Author

**Scott Hetrick**
- Portfolio: [scottjhetrick.com](https://scottjhetrick.com)
- GitHub: [@dreadhalor](https://github.com/dreadhalor)

---

## 🙏 Acknowledgments

- **Giphy**: For providing the excellent GIF API
- **dread-ui**: Custom component library providing consistent UI elements
- **React Masonry CSS**: For the responsive grid layout

---

## 📊 Performance

- **Initial Load**: < 2s (optimized bundle size)
- **Search Response**: Near-instant with Giphy API
- **Responsive Grid**: Adapts smoothly to all screen sizes
- **Memoization**: Prevents unnecessary re-renders

---

## 🐛 Known Issues

None at this time! If you discover any issues, please report them in the main repository.

---

## 🔮 Future Enhancements

Potential improvements for future versions:

- [ ] Infinite scroll for search results
- [ ] Favorite/saved GIFs functionality
- [ ] Advanced search filters (ratings, dimensions, etc.)
- [ ] GIF upload and sharing features
- [ ] User accounts and personalization
- [ ] Social sharing integration
- [ ] Offline support with service workers

---

**Happy GIF hunting! 🎉**
