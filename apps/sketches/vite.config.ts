import { type PluginOption, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths() as PluginOption],
  base: '/sketches/',
  // One React in the bundle: the monorepo's install nests React 19 under shared packages.
  resolve: { dedupe: ['react', 'react-dom'] },
});
