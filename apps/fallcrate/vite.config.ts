import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  // I hate TypeScript sometimes
  plugins: [react(), tailwindcss(), tsconfigPaths() as any, svgr() as any],
  base: '/fallcrate/',
});
