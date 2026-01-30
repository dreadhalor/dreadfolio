import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [basicSsl(), tsconfigPaths(), svgr()],
  base: '/ascii-video/',
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['@tensorflow/tfjs'],
  },
});
