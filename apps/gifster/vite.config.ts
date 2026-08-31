import { type PluginOption, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // use-sync-external-store carries a nested react@19 (auto-install-peers);
    // without dedupe the bundle gets two React runtimes and hooks explode.
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    react() as PluginOption,
    tailwindcss(),
    tsconfigPaths() as unknown as PluginOption,
    svgr() as unknown as PluginOption,
  ],
  base: '/gifster/',
});
