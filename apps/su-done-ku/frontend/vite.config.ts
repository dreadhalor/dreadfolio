import { type PluginOption, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // A nested react@19 (auto-install-peers) would give the bundle two React runtimes.
    dedupe: ['react', 'react-dom'],
  },
  plugins: [react() as PluginOption, tailwindcss(), tsconfigPaths() as unknown as PluginOption],
  base: '/su-done-ku/',
});
