import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Only use HTTPS in dev if certificates exist
const certPath = path.resolve(__dirname, '.cert/key.pem');
const hasCerts = fs.existsSync(certPath);

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths(), svgr()],
  base: '/ascii-video/',
  server: hasCerts ? {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/cert.pem')),
    },
  } : {},
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
