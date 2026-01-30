import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths(), svgr()],
  base: '/ascii-video/',
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/cert.pem')),
    },
  },
  worker: {
    format: 'es',
  },
  define: {
    'global': 'globalThis',
  },
  optimizeDeps: {
    include: ['long'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
